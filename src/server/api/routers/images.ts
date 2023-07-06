import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from '~/env.mjs';
import { TRPCError } from '@trpc/server';

export const imagesRouter = createTRPCRouter({
  getAll: protectedProcedure.query(({ }) => {
    // const images = Array<string>(21).fill("https://placehold.co/256x256");
    const images: string[] = [];
    return images;
  }),
  generateImage: protectedProcedure.input(z.object({
    prompt: z.string().trim().min(3)
  })).mutation(async ({ input: { prompt }, ctx }) => {
    const configuration = new Configuration({
      apiKey: env.OPEN_API_KEY
    });

    const openAi = new OpenAIApi(configuration);

    if (await moderateText(openAi, prompt)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: "The given prompt had been flagged as invalid"
      })
    }

    const imageResponse = await openAi.createImage({
      prompt,
      response_format: 'url',
      n: 1,
      size: '512x512',
      user: ctx.user.id
    });

    const imageData = imageResponse.data;
  })
});

async function moderateText(openAi: OpenAIApi, prompt: string): Promise<boolean> {
  const moderationResponse = await openAi.createModeration({
    input: prompt
  });

  const data = moderationResponse.data;
  const flaggedResult = data.results.find(x => x.flagged === true);

  if (flaggedResult) {
    console.error("Prompt was flagged", flaggedResult);
  }

  return flaggedResult == null ? false : true;
}
