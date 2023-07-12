import { type NextApiRequest, type NextApiResponse } from "next";
import { GENERATE_IMAGE_COUNT, GENERATE_IMAGE_SIZE } from "~/common/constants";
import { env } from "~/env.mjs";
import { z } from 'zod';
import { generateImageInputSchema } from "~/server/api/routers/images";
import { redisInstance } from "~/utils/redis";
import { FileHandler } from "~/server/services/fileHandler";
import { getAuth } from "@clerk/nextjs/server";
import { verifySignature } from "@upstash/qstash/nextjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const path = req.query.path;

    if (typeof path !== "string" || req.method !== "POST") {
        res.status(405).end();
        return;
    }

    switch (path) {
        case 'generate': {
            await handleGenerate(req, res);
            break;
        }
        case 'poll': {
            await handlePoll(req, res);
            break;
        }
        case 'callback': {
            await verifySignature(handleCallback)(req, res);
            break;
        }
        default: {
            res.status(404).end();
            break;
        }
    }
}

function getApiUrl() {
    if (process.env.SERVER_URL) {
        return process.env.SERVER_URL;
    }

    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }

    throw new Error("Unable to determine API url");
}

async function handleGenerate(req: NextApiRequest, res: NextApiResponse) {
    // https://platform.openai.com/docs/api-reference/images
    const OPENAI_GENERATE_URL = "https://api.openai.com/v1/images/generations";

    const { userId } = getAuth(req);

    if (userId == null) {
        return res.status(401).end();
    }
    // Validate the request
    const validationResult = generateImageInputSchema.safeParse(req.body);

    if (validationResult.success === false) {
        return res.status(400).json({ message: validationResult.error.message });
    }

    const apiUrl = getApiUrl();
    const { data } = validationResult;
    const { prompt } = data;

    console.log(`Publishing request to Qstash for prompt: ${prompt}`);

    try {
        // https://docs.upstash.com/qstash/openapi#operation/publish
        const response = await fetch(`${env.QSTASH_URL}/publish/${OPENAI_GENERATE_URL}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${env.QSTASH_TOKEN}`,
                "Content-Type": "application/json",
                "Upstash-forward-Authorization": `Bearer ${env.OPENAI_API_KEY}`,
                "Upstash-Callback": `${apiUrl}/api/image/callback`,
            },
            body: JSON.stringify({
                prompt,
                n: GENERATE_IMAGE_COUNT,
                size: GENERATE_IMAGE_SIZE,
                response_format: "b64_json",
            }),
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const json: { messageId: string } = await response.json();
        await redisInstance.set(json.messageId, { prompt, userId }, {
            ex: 1000 * 60 * 10, // 10min
        });
        return res.status(202).json({ messageId: json.messageId });
    } catch (err) {
        console.error(err);
        const message = getErrorMessage(err);
        return res
            .status(500)
            .json({ message });
    }
}

async function handlePoll(req: NextApiRequest, res: NextApiResponse) {
    const requestSchema = z.object({
        messageId: z.string()
    });

    const validationResult = requestSchema.safeParse(req.body);

    if (validationResult.success === false) {
        return res.status(400).json({ message: validationResult.error.message });
    }

    const { data } = validationResult;
    const json = await redisInstance.get<{ urls: string[] }>(data.messageId);

    console.log({ json });

    if (json?.urls == null) {
        return res.status(404).json({ message: "No data found" });
    }

    return res.json(json);
}

async function handleCallback(req: NextApiRequest, res: NextApiResponse) {
    // TODO: Verify signature
    const qStashBodySchema = z.object({
        status: z.number(),
        sourceMessageId: z.string(),
        header: z.record(z.string(), z.array(z.string())),
        body: z.string(),
    });

    const openAiResponseSchema = z.object({
        data: z.array(z.object({
            url: z.string()
        }))
    })

    const messageDataSchema = z.object({
        prompt: z.string(),
        userId: z.string()
    })

    const validationResult = qStashBodySchema.safeParse(req.body);

    if (validationResult.success === false) {
        console.error(validationResult.error.message);
        return res.status(500).json({ message: "Failed to process request" });
    }

    console.log("Received Qstash request callback");

    try {
        const messageDataJson = await redisInstance.get<string>(validationResult.data.sourceMessageId);
        const messageData = messageDataSchema.parse(messageDataJson);

        const encoder = new TextEncoder();
        const { data } = validationResult;
        const decoded = atob(data.body);

        console.log({ messageData, openAiResponse: decoded });

        // Save image to the file handler
        if (true) {
            const openAiResponse = openAiResponseSchema.safeParse(JSON.parse(decoded));
            if (openAiResponse.success === false) {
                //return res.status(500).json({ message: "Invalid open ai response" });
            }

            console.log(openAiResponse);
            // const blobs: Blob[] = [];
            // for (const data of openAiResponse.data.data) {
            //     const decodedImage = atob(data.url);
            //     const bytes = encoder.encode(decodedImage);
            //     const blob = new Blob([bytes]);
            //     blobs.push(blob);
            // }

            // if (blobs.length === 0) {
            //     return res.status(500).json({ message: "No images to upload" });
            // }

            // await FileHandler.uploadFiles(blobs, {
            //     metadata: {
            //         prompt: messageData.prompt,
            //         userId: messageData.userId
            //     }
            // })
        }

        res.status(200).json(decoded);
    }
    catch (err) {
        console.error(err);
        const message = getErrorMessage(err);
        return res.status(500).json({ message });
    }
}

function getErrorMessage(err: unknown) {
    const schema = z.object({
        message: z.string()
    })

    const result = schema.safeParse(err);
    return result.success === true ? result.data.message : "Something went wrong";
}