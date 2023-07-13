import { type NextApiRequest, type NextApiResponse } from "next";
import { GENERATE_IMAGE_COUNT, GENERATE_IMAGE_SIZE } from "~/common/constants";
import { env } from "~/env.mjs";
import { ZodError, z } from 'zod';
import { generateImageInputSchema } from "~/server/api/routers/images";
import { redisInstance } from "~/utils/redis";
import { FileHandler } from "~/server/services/fileHandler";
import { getAuth } from "@clerk/nextjs/server";
import { verifySignature } from "@upstash/qstash/nextjs";
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from "@trpc/server/http";
import { GeneratedImages, UserAccounts } from "~/server/db/repositories";

const imageRequestStatusSchema = z.discriminatedUnion("status", [
    z.object({
        status: z.literal('waiting'),
        userId: z.string(),
        prompt: z.string()
    }),
    z.object({
        status: z.literal('done'),
        urls: z.array(z.string())
    })
]);

type ImageRequestStatus = z.infer<typeof imageRequestStatusSchema>;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const path = req.query.image;

    if (typeof path !== "string" || req.method !== "POST") {
        res.status(405).end();
        return;
    }

    try {
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
    catch (err) {
        console.error(err);

        if (err instanceof TRPCError) {
            const httpCode = getHTTPStatusCodeFromError(err);
            return res.status(httpCode).json({ message: err.message });
        }
        else if (err instanceof ZodError) {
            return res.status(500).json({ message: err.message });
        }
        else if (err instanceof Error) {
            return res.status(500).json({ message: err.message })
        }
        else {
            const obj = err as { message: string }
            if (obj?.message === 'string') {
                return res.status(500).json({ message: obj.message })
            }

            return res.status(500).json({ message: err?.toString() ?? "Something went wrong" });
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
        throw new TRPCError({ code: 'FORBIDDEN' })
    }

    const userAccount = await UserAccounts.getOrCreateUserAccount(userId);

    if (!userAccount.isUnlimited && userAccount.imageGenerationTokens <= 0) {
        throw new TRPCError({
            code: 'BAD_REQUEST',
            message: "You don't have enough tokens to generate images"
        })
    }

    // Validate the request
    const validationResult = generateImageInputSchema.safeParse(req.body);

    if (validationResult.success === false) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: validationResult.error.message })
    }

    const apiUrl = getApiUrl();
    const { data } = validationResult;
    const { prompt } = data;

    console.log(`Publishing request to Qstash for prompt: ${prompt}`);

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
    await redisInstance.set<ImageRequestStatus>(json.messageId, { status: 'waiting', userId, prompt }, {
        ex: 1000 * 60 * 10, // 10min
    });

    return res.status(202).json({ messageId: json.messageId });
}

async function handleCallback(req: NextApiRequest, res: NextApiResponse) {
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

    const qstashMessage = qStashBodySchema.parse(req.body);
    console.log("Received Qstash request callback");

    async function innerHandleCallback() {
        const imageRequestStatus$ = await redisInstance.get<ImageRequestStatus>(qstashMessage.sourceMessageId);
        const imageRequestStatus = imageRequestStatusSchema.parse(imageRequestStatus$);

        if (imageRequestStatus?.status !== 'waiting') {
            const status = imageRequestStatus?.status as unknown as string;
            throw new TRPCError({
                code: 'INTERNAL_SERVER_ERROR',
                message: `Expected image request status to be 'waiting' but was ${status}`
            })
        }

        const { userId, prompt } = imageRequestStatus;
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);

        if (userAccount == null) {
            throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const encoder = new TextEncoder();
        const decoded = atob(qstashMessage.body);

        console.log({ imageRequestStatus, openAiResponse: decoded });

        // Save image to the file handler
        const openAiResponse = openAiResponseSchema.safeParse(JSON.parse(decoded));

        if (openAiResponse.success === false) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "Invalid open ai response" })
        }

        const blobs: Blob[] = [];

        for (const data of openAiResponse.data.data) {
            const decodedImage = atob(data.url);
            const bytes = encoder.encode(decodedImage);
            const blob = new Blob([bytes]);
            blobs.push(blob);
        }

        if (blobs.length === 0) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: "No images to upload" })
        }

        const imageResult = await FileHandler.uploadFiles(blobs, {
            metadata: { prompt, userId }
        });

        // Add generated images to the user
        const input = imageResult.map(x => ({ key: x.key, prompt }));
        await GeneratedImages.saveGeneratedImages(userId, input)

        if (!userAccount.isUnlimited) {
            // Decrement tokens count
            await UserAccounts.decrementTokenCount(userId, GENERATE_IMAGE_COUNT);
        }

        const urls = imageResult.map(url => ({ url }));
        await redisInstance.set<ImageRequestStatus>(qstashMessage.sourceMessageId, {
            status: 'done',
            urls: imageResult.map(x => x.url)
        });

        return res.status(200).json({ urls });
    }

    try {
        await innerHandleCallback();
    } catch (err) {
        await redisInstance.del(qstashMessage.sourceMessageId)
        throw err;
    }
}

async function handlePoll(req: NextApiRequest, res: NextApiResponse) {
    const requestSchema = z.object({
        messageId: z.string()
    });

    const data = requestSchema.parse(req.body);
    const json = await redisInstance.get<ImageRequestStatus>(data.messageId);
    const imageRequestStatus = imageRequestStatusSchema.parse(json);

    switch (imageRequestStatus.status) {
        case 'waiting':
            throw new TRPCError({ code: 'NOT_FOUND' })
        case 'done':
            return res.status(200).json({ urls: imageRequestStatus.urls })
        default:
            throw new TRPCError({ code: 'BAD_REQUEST', message: "Request cannot be completed" })
    }
}

