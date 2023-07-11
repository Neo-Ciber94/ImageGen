import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// A ratelimiter, that allows 5 requests per 5 seconds

export const ratelimiter = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "5 s"),
    analytics: true,
    prefix: "image-gen/ratelimit",
});