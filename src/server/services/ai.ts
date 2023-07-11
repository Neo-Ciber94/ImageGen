import { Configuration, OpenAIApi } from "openai";
import { env } from '~/env.mjs';

const configuration = new Configuration({
    apiKey: env.OPEN_API_KEY
});

const openAi = new OpenAIApi(configuration);

interface GenerateImageOptions {
    prompt: string;
    userId?: string;
    count: number
}

export interface GeneratedImageData {
    blob: Blob,
    url: string;
    prompt: string;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AI {
    export async function generateImages({ prompt, userId, count }: GenerateImageOptions) {
        const imageResponse = await openAi.createImage({
            prompt,
            response_format: 'url',
            n: count,
            size: '512x512',
            user: userId
        });

        const imageData = imageResponse.data;

        if (imageData.data.length === 0) {
            throw new Error("no were returned from OpenAI");
        }

        console.log("generated images: ", imageData.data);

        const imagesPromises: Promise<GeneratedImageData>[] = [];

        for (const d of imageData.data) {
            const imageUrl = d.url;

            if (imageUrl == null) {
                throw new Error("Image url was null");
            }

            const fetchImage = async () => {
                const res = await fetch(imageUrl);

                if (!res.ok) {
                    const error = await res.text();
                    throw new Error(`Failed to fetch image (${res.statusText}) ${imageUrl}: ${error}`);
                }

                const imageBlob = await res.blob();

                return {
                    blob: imageBlob,
                    url: imageUrl,
                    prompt
                }
            }

            imagesPromises.push(fetchImage());
        }

        const result = await Promise.all(imagesPromises);
        console.log(`${result.length} images were generated for prompt: ${prompt}`);
        return result;
    }

    export async function moderateContent(input: string) {
        const moderationResponse = await openAi.createModeration({
            input
        });

        const data = moderationResponse.data;
        const isFlagged = data.results.some(x => x.flagged === true);

        return {
            results: data.results,
            isFlagged
        }
    }
}


