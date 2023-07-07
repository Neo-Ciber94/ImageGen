import { eq } from "drizzle-orm";
import { db } from "./drizzle";
import { generatedImage, userAccount } from "drizzle/schema";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UserAccounts {
    export async function getOrCreateUserAccount(userId: string) {
        const userAccountResults = await db.select()
            .from(userAccount)
            .where(eq(userAccount.userId, userId));

        if (userAccountResults.length > 1) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return userAccountResults[0]!;
        }

        const result = await db.insert(userAccount).values({ userId }).returning();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-non-null-assertion
        return result[0]!;
    }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GeneratedImages {
    export async function getAllImages(userId: string) {
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        const images = await db.select().from(generatedImage).where(eq(generatedImage.userAccountId, userAccount.id));
        return images;
    }
}
