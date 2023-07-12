import { Redis } from "@upstash/redis/nodejs";

export const redisInstance = Redis.fromEnv();