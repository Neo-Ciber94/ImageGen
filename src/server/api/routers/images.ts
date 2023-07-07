import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { generateImages, moderateContent } from '~/server/common/ai';
import { getImageUrl, uploadFiles } from '~/server/common/fileManager';
import { GeneratedImages } from '~/server/db/repositories';

export const imagesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .output(z.array(z.object({ url: z.string(), prompt: z.string(), createdAt: z.date() })))
    .query(async ({ ctx }) => {
      const generatedImagesResult = await GeneratedImages.getAllImages(ctx.user.id);
      return generatedImagesResult.map(x => ({ ...x, url: getImageUrl(x.key) }))
    }),
  generateImage: protectedProcedure.input(z.object({
    prompt: z.string().trim().min(3)
  })).mutation(async ({ input: { prompt }, ctx }) => {

    try {
      const moderation = await moderateContent(prompt);

      if (moderation.isFlagged) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: "The given prompt had been flagged as invalid"
        });
      }

      const images = await generateImages({ prompt, count: 1, userId: ctx.user.id });
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
  })
});

