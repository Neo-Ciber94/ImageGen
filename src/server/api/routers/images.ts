import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from '@trpc/server';
import { generateImages, moderateContent } from '~/server/common/ai';
import { uploadFiles } from '~/server/common/fileManager';

export const imagesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ }) => {
    // const images = Array<string>(21).fill("https://placehold.co/256x256");
    const images: string[] = [];
    return images;
  }),
  generateImage: protectedProcedure.input(z.object({
    prompt: z.string().trim().min(3)
  })).mutation(async ({ input: { prompt }, ctx }) => {
    const moderation = await moderateContent(prompt);

    if (moderation.isFlagged) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "The given prompt had been flagged as invalid"
      })
    }

    const images = await generateImages({ prompt, count: 1, userId: ctx.user.id });
    const blobs = images.map(img => img.blob);
    const imageUrls = await uploadFiles(blobs, {
      metadata: {
        userId: ctx.user.id,
        prompt
      }
    });

    // Add generated images to the user

    return imageUrls;
  })
});