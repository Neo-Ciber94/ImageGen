import { type InferModel, eq, and, sql, gte, desc } from "drizzle-orm";
import { db } from "./drizzle";
import { generatedImages, userAccounts } from "drizzle/schema";
import { clerkClient } from "@clerk/nextjs";

export const DEFAULT_USER_TOKEN_COUNT = 20;

export type GeneratedImageModel = InferModel<typeof generatedImages>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserAccounts {
    export async function getOrCreateUserAccount(userId: string) {
        const userAccountResults = await db.select()
            .from(userAccounts)
            .where(eq(userAccounts.userId, userId));

        if (userAccountResults.length >= 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return userAccountResults[0]!;
        }

        const user = await clerkClient.users.getUser(userId);
        const userName = user.username || user.emailAddresses[0]?.emailAddress || user.firstName;
        const result = await db.insert(userAccounts)
            .values({ userId, userName, imageGenerationTokens: DEFAULT_USER_TOKEN_COUNT })
            .returning();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-non-null-assertion
        return result[0]!;
    }

    export async function decrementTokenCount(userId: string, count: number) {
        if (count <= 0) {
            throw new Error("count to decrement should be greater than zero");
        }

        const result = await UserAccounts.getOrCreateUserAccount(userId);

        if (result.imageGenerationTokens <= 0) {
            return;
        }

        await db.update(userAccounts)
            .set({ imageGenerationTokens: result.imageGenerationTokens - count })
            .where(eq(userAccounts.userId, userId));
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GeneratedImages {
    export interface GetAllImagesOptions {
        search?: string | null,
        limit: number | null,
        cursor?: number | null,
    }

    export async function getAllImages(userId: string, options?: GetAllImagesOptions) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        if (options) {
            const { search, limit, cursor } = options;

            if (search && search.trim().length > 0) {
                const query = `%${search.toLowerCase()}%`;
                const images = await db.select()
                    .from(generatedImages)
                    .limit(limit ?? 100)
                    .where(and(
                        gte(generatedImages.id, cursor ?? 0),
                        eq(generatedImages.userAccountId, userAccount.id),
                        sql`LIKE(LOWER(${generatedImages.prompt}), ${query})`
                    ))
                    .orderBy(desc(generatedImages.createdAt));

                return images;
            }
        }

        const images = await db.select()
            .from(generatedImages)
            .where(eq(generatedImages.userAccountId, userAccount.id))
            .orderBy(desc(generatedImages.createdAt))

        return images;
    }

    export async function saveGeneratedImages(userId: string, data: Pick<GeneratedImageModel, 'key' | 'prompt'>[]) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);

        const input = data.map(x => ({ ...x, userAccountId: userAccount.id }));
        const result = await db.insert(generatedImages).values(input).returning();
        return result;
    }

    export async function deleteImage(userId: string, generatedImageId: number) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        const deleted = await db.delete(generatedImages)
            .where(
                and(
                    eq(generatedImages.id, generatedImageId),
                    eq(generatedImages.userAccountId, userAccount.id)
                )
            )
            .returning();

        return deleted[0];
    }
}
