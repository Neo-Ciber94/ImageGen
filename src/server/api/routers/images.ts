import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { generateImages, moderateContent } from '~/server/common/ai';
import { getImageUrl, uploadFiles } from '~/server/common/fileManager';
import { GeneratedImages, UserAccounts } from '~/server/db/repositories';

const IMAGE_COUNT = 1;
const MAX_PROMPT_LENGTH = 800;
const DEFAULT_LIMIT = 100;

export const imagesRouter = createTRPCRouter({
  // Get all images
  getAll: protectedProcedure
    .input(z.object({
      q: z.string().trim().nullish(),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.number().nullish()
    }))
    .output(z.array(z.object({ id: z.number(), url: z.string(), prompt: z.string(), createdAt: z.date() })))
    .query(async ({ ctx, input: { q, limit = DEFAULT_LIMIT, cursor } }) => {
      const generatedImagesResult = await GeneratedImages.getAllImages(ctx.user.id, { search: q, limit, cursor });
      return generatedImagesResult.map(x => ({ ...x, url: getImageUrl(x.key) }))
    }),

  // Generate a new image
  generateImage: protectedProcedure.input(z.object({
    prompt: z.string().trim().min(3).max(MAX_PROMPT_LENGTH)
  })).mutation(async ({ input: { prompt }, ctx }) => {

    try {
      const userAccount = await UserAccounts.getOrCreateUserAccount(ctx.user.id);

      if (!userAccount.isUnlimited && userAccount.imageGenerationTokens <= 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "You don't have enough tokens to generate images"
        })
      }

      const moderation = await moderateContent(prompt);

      if (moderation.isFlagged) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "The given prompt had been flagged as invalid"
        });
      }

      const images = await generateImages({ prompt, count: IMAGE_COUNT, userId: ctx.user.id });
      const blobs = images.map(img => img.blob);
      const imageResult = await uploadFiles(blobs, {
        metadata: {
          userId: ctx.user.id,
          prompt
        }
      });

      // Add generated images to the user
      const input = imageResult.map(x => ({ key: x.key, prompt }));
      await GeneratedImages.saveGeneratedImages(ctx.user.id, input)

      if (!userAccount.isUnlimited) {
        // Decrement tokens count
        await UserAccounts.decrementTokenCount(ctx.user.id, IMAGE_COUNT);
      }

      return imageResult.map(x => x.url);
    }
    catch (err) {
      console.error(err);
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const result = await GeneratedImages.deleteImage(ctx.user.id, id);

      if (result == null) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return result;
    })
});

