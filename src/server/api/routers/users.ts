import { UserAccounts } from "~/server/db/repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
    getTokenCount: protectedProcedure.query(async ({ ctx }) => {
        const userId = ctx.user.id;
        const userAccount = await UserAccounts.getOrCreateUserAccount(userId);
        return userAccount.isUnlimited ? 'unlimited' : userAccount.imageGenerationTokens;
    })
})