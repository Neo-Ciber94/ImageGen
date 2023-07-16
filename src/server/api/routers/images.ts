import { z } from 'zod';
import { createTRPCRouter, isRateLimited, isPromptImprovementRateLimited, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { AI } from '~/server/services/ai';
import { FileHandler } from '~/server/services/fileHandler';
import { GeneratedImages, UserAccounts } from '~/server/db/repositories';
import { GENERATE_IMAGE_COUNT, MAX_PROMPT_LENGTH } from '~/common/constants';
import * as blurhash from "blurhash";
import sharp from 'sharp';

const getImagesResultScheme = z.object({
  images: z.array(z.object({
    id: z.number(),
    url: z.string(),
    prompt: z.string(),
    blurHash: z.string().nullable(),
    createdAt: z.date()
  })),
  nextCursor: z.number().nullish()
})

export const generateImageInputSchema = z.object({
  prompt: z.string().trim().min(3).max(MAX_PROMPT_LENGTH)
});

export const imagesRouter = createTRPCRouter({
  // Get all images
  getAll: protectedProcedure
    .input(z.object({
      search: z.string().trim().nullish(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish()
    }))
    .output(getImagesResultScheme)
    .query(async ({ ctx, input }) => {
      const { search, cursor } = input;
      const limit = input.limit ?? 100;

      const result = await GeneratedImages.getAllImages(ctx.user.id, { search, limit, page: cursor });
      const images = result.images.map(x => ({ ...x, url: FileHandler.getImageUrl(x.key) }));
      return { images, nextCursor: result.nextPage }
    }),

  // Generate a new image
  generateImage: protectedProcedure
    .use(isRateLimited)
    .input(generateImageInputSchema)
    .mutation(async ({ input: { prompt }, ctx }) => {

      try {
        const userAccount = await UserAccounts.getOrCreateUserAccount(ctx.user.id);

        if (!userAccount.isUnlimited && userAccount.imageGenerationTokens <= 0) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You don't have enough tokens to generate images"
          })
        }

        const moderation = await AI.moderateContent(prompt);

        if (moderation.isFlagged) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "The given prompt had been flagged as invalid"
          });
        }

        const images = await AI.generateImages({ prompt, count: GENERATE_IMAGE_COUNT, userId: ctx.user.id });
        const blobs = images.map(img => img.blob);
        const uploadResults = await FileHandler.uploadFiles(blobs, {
          metadata: {
            userId: ctx.user.id,
            prompt
          }
        });

        // Add generated images to the user
        const input: {
          key: string;
          prompt: string;
          blurHash: string | undefined;
        }[] = [];

        // See: https://css-tricks.com/inline-image-previews-with-sharp-blurhash-and-lambda-functions/
        for (const upload of uploadResults) {
          let blurHash: string | undefined;

          try {
            const sharpImage = sharp(await upload.blob.arrayBuffer());
            const imageMetadata = await sharpImage.metadata();
            const buffer = await sharpImage
              .raw()
              .ensureAlpha()
              .toBuffer();

            const bytes = new Uint8ClampedArray(buffer);
            const resultBlurHash = blurhash.encode(bytes, imageMetadata.width as number, imageMetadata.height as number, 4, 4);
            const validBlurHash = blurhash.isBlurhashValid(resultBlurHash);
            if (validBlurHash.result === true) {
              blurHash = resultBlurHash;
            } else {
              console.error(validBlurHash.errorReason)
            }
          }
          catch (err) {
            console.error(err);
          }

          input.push({ key: upload.key, prompt, blurHash });
        }

        await GeneratedImages.saveGeneratedImages(ctx.user.id, input)

        if (!userAccount.isUnlimited) {
          // Decrement tokens count
          await UserAccounts.decrementTokenCount(ctx.user.id, GENERATE_IMAGE_COUNT);
        }

        return uploadResults.map(url => ({ url }));
      }
      catch (err) {
        console.error(err);

        if (err instanceof TRPCError) {
          throw err;
        }

        const message = err instanceof Error ? err.message : err?.toString() ?? "Something went wrong";
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: err,
          message
        })
      }
    }),

  // Delete image
  deleteImage: protectedProcedure
    .use(isRateLimited)
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const result = await GeneratedImages.deleteImage(ctx.user.id, id);

      if (result == null) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      try {
        await FileHandler.deleteFile(result.key);
      } catch (err) {
        console.error(err);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: "Failed to delete s3 image"
        });
      }

      return result;
    }),

  // Improve a text prompt
  improvePrompt: protectedProcedure
    .use(isPromptImprovementRateLimited)
    .input(generateImageInputSchema)
    .mutation(async ({ input: { prompt }, ctx }) => {
      try {
        const moderation = await AI.moderateContent(prompt);

        if (moderation.isFlagged) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "The given prompt had been flagged as invalid"
          });
        }

        const improvedPrompt = await AI.improveImagePrompt({ prompt, userId: ctx.user.id });
        return improvedPrompt;
      }
      catch (err) {
        console.error(err);

        if (err instanceof TRPCError) {
          throw err;
        }

        const message = err instanceof Error ? err.message : err?.toString() ?? "Something went wrong";
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          cause: err,
          message
        })
      }
    })
});
