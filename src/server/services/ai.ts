import { TRPCError } from "@trpc/server";
import { OpenAI } from "openai";
import { MAX_PROMPT_LENGTH } from "~/common/constants";
import { env } from "~/env.mjs";

const openAi = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

interface GenerateImageOptions {
  prompt: string;
  userId?: string;
  count: number;
}

export interface GeneratedImageData {
  blob: Blob;
  url: string;
  prompt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AI {
  export async function generateImages({
    prompt,
    userId,
    count,
  }: GenerateImageOptions) {
    const imageResponse = await openAi.images.generate({
      prompt,
      n: count,
      response_format: "url",
      model: "dall-e-3",
      user: userId,
    });

    const imageData = imageResponse.data;

    if (imageData.length === 0) {
      throw new Error("no were returned from OpenAI");
    }

    console.log("generated images: ", imageData);

    const imagesPromises: Promise<GeneratedImageData>[] = [];

    for (const d of imageData) {
      const imageUrl = d.url;

      if (imageUrl == null) {
        throw new Error("Image url was null");
      }

      const fetchImage = async () => {
        const res = await fetch(imageUrl);

        if (!res.ok) {
          const error = await res.text();
          throw new Error(
            `Failed to fetch image (${res.statusText}) ${imageUrl}: ${error}`
          );
        }

        const imageBlob = await res.blob();

        return {
          blob: imageBlob,
          url: imageUrl,
          prompt,
        };
      };

      imagesPromises.push(fetchImage());
    }

    const result = await Promise.all(imagesPromises);
    console.log(`${result.length} images were generated for prompt: ${prompt}`);
    return result;
  }

  export async function moderateContent(input: string) {
    const moderationResponse = await openAi.moderations.create({
      input,
    });

    const isFlagged = moderationResponse.results.some(
      (x) => x.flagged === true
    );

    return {
      results: moderationResponse.results,
      isFlagged,
    };
  }

  export async function improveImagePrompt({
    prompt,
    userId,
  }: {
    prompt: string;
    userId: string;
  }) {
    console.log(`Prompt to update: ${prompt}`);

    const ERROR_MESSAGE = "[INVALID PROMPT]";
    const response = await openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      user: userId,
      temperature: 1.6,
      stream: false,
      messages: [
        {
          // We seed the max characters but currently the AI may not be able to infer that
          role: "system",
          content: `You are an assistant that improve image generation prompts, for a given
                    prompt you MUST return a more detailed version in a single paragraph with less than ${MAX_PROMPT_LENGTH} characters
                    of text with more details if not specified but if the prompt is not a valid
                    word or phrase return the text: "${ERROR_MESSAGE}".`,
        },
        {
          role: "assistant",
          content: prompt,
        },
      ],
    });

    const choice = response.choices[0];
    const content = choice?.message?.content;

    console.log(`Updated prompt content: '${content ?? ""}'`);

    if (content == null) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Invalid OpenAI response",
      });
    }

    if (content.includes(ERROR_MESSAGE)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No enough context to improve the prompt",
      });
    }

    return content;
  }
}
