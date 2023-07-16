import { pgTable, integer, serial, text, uniqueIndex, boolean, timestamp, date } from 'drizzle-orm/pg-core';

export const userAccounts = pgTable('userAccount', {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    userName: text('userName'),
    imageGenerationTokens: integer('imageGenerationTokens').notNull().default(0),
    nextTokenRegeneration: date('nextTokenRegeneration'),
    isUnlimited: boolean('isUnlimited').notNull().default(false),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
}, userAccount => {
    return {
        userIdIndex: uniqueIndex('userIdIndex').on(userAccount.userId)
    }
});

export const generatedImages = pgTable('generatedImage', {
    id: serial('id').primaryKey(),
    userAccountId: integer('userAccountId').references(() => userAccounts.id),
    prompt: text('prompt').notNull(),
    key: text('key').notNull(),
    blurHash: text('blurHash'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
})