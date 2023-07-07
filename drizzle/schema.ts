import { pgTable, integer, serial, text, uniqueIndex, boolean, timestamp } from 'drizzle-orm/pg-core';

export const userAccount = pgTable('userAccount', {
    id: serial('id').primaryKey(),
    userId: text('userId').notNull(),
    imageGenerationTokens: integer('imageGenerationTokens').notNull().default(0),
    isUnlimited: boolean('isUnlimited').notNull().default(false),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
}, userAccount => {
    return {
        userIdIndex: uniqueIndex('userIdIndex').on(userAccount.userId)
    }
});

export const generatedImage = pgTable('generatedImage', {
    id: serial('id').primaryKey(),
    userAccountId: integer('userAccountId').references(() => userAccount.id),
    prompt: text('prompt').notNull(),
    key: text('key').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
})