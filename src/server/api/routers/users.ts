import { UserAccounts } from "~/server/db/repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    getTokenCount: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        const nextRegeneration = await UserAccounts.checkTokenRegeneration(userId);
        const tokenCount = userAccount.isUnlimited ? 'unlimited' : userAccount.imageGenerationTokens;

        return {
            nextRegeneration,
            tokenCount
        }
    })
})