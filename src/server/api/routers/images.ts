import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Configuration, OpenAIApi } from "openai";
import { env } from '~/env.mjs';
import { TRPCError } from '@trpc/server';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from 'nanoid';

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
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_KEY
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    const imageUrl = imageData.data[0]?.url!;
    const imageKey = nanoid();
    const res = await fetch(imageUrl);
    const binaryData = await res.arrayBuffer();
    const contentType = res.headers.get('Content-Type')!;
    const imageFormat = contentType.startsWith('image/') ? contentType.slice('image/'.length) : undefined;

    await s3Client.send(new PutObjectCommand({
      Bucket: env.AWS_BUCKET_NAME,
      Key: imageKey,
      Body: `${binaryData}.${imageFormat}`,
      ContentType: res.headers.get('Content-Type')
    }));

    // Add image record to database
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
