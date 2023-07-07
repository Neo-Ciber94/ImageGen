import { type InferModel, eq, and } from "drizzle-orm";
import { db } from "./drizzle";
import { generatedImage, userAccount } from "drizzle/schema";

export type GeneratedImage = InferModel<typeof generatedImage>;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserAccounts {
    export async function getOrCreateUserAccount(userId: string) {
        const userAccountResults = await db.select()
            .from(userAccount)
            .where(eq(userAccount.userId, userId));

        if (userAccountResults.length >= 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return userAccountResults[0]!;
        }

        const result = await db.insert(userAccount).values({ userId }).returning();
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

        await db.update(userAccount)
            .set({ imageGenerationTokens: result.imageGenerationTokens - count })
            .where(eq(userAccount.userId, userId));
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GeneratedImages {
    export async function getAllImages(userId: string) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        const images = await db.select().from(generatedImage).where(eq(generatedImage.userAccountId, userAccount.id));
        return images;
    }

    export async function saveGeneratedImages(userId: string, data: Pick<GeneratedImage, 'key' | 'prompt'>[]) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);

        const input = data.map(x => ({ ...x, userAccountId: userAccount.id }));
        const result = await db.insert(generatedImage).values(input).returning();
        return result;
    }

    export async function deleteImage(userId: string, generatedImageId: number) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        const deleted = await db.delete(generatedImage)
            .where(
                and(
                    eq(generatedImage.id, generatedImageId),
                    eq(generatedImage.userAccountId, userAccount.id)
                )
            )
            .returning();

        return deleted[0];
    }
}
