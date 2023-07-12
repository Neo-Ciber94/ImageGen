import { Ratelimit } from "@upstash/ratelimit";
import { redisInstance } from "./redis";

// A ratelimiter, that allows 5 requests per 5 seconds

export const ratelimiter = new Ratelimit({
    redis: redisInstance,
    limiter: Ratelimit.slidingWindow(5, "5 s"),
    analytics: true,
    prefix: "image-gen/ratelimit",
});