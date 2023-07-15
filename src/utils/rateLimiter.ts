import { Ratelimit } from "@upstash/ratelimit";
import { redisInstance } from "./redis";

export type Limiter = Ratelimit['limiter'];

export function createRateLimiter(name: string, limiter: Limiter) {
    return new Ratelimit({
        limiter: limiter,
        redis: redisInstance,
        analytics: true,
        prefix: `image-gen/ratelimit-${name}`,
    })
}