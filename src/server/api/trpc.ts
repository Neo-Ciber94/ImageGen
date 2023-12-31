/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { TRPCError, initTRPC } from "@trpc/server";
import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import superjson from "superjson";
import { ZodError } from "zod";
import { type User, getAuth, clerkClient } from "@clerk/nextjs/server";
import { type Limiter, createRateLimiter } from "~/utils/rateLimiter";
import { type NextApiRequest } from "next";
import { Ratelimit } from "@upstash/ratelimit";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

type CreateContextOptions = {
  user: User | null | undefined,
  req: NextApiRequest
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = ({ user }: CreateContextOptions) => {
  return {
    user
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async ({ req }: CreateNextContextOptions) => {
  const { userId } = getAuth(req);
  let user: User | null | undefined = null;

  if (userId) {
    user = await clerkClient.users.getUser(userId);
  }

  return createInnerTRPCContext({
    user,
    req
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * The base middleware.
 */
export const middleware = t.middleware;

export const isAuthenticated = middleware(async (opts) => {
  const { ctx } = opts;

  if (ctx.user == null) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return opts.next({
    ctx: {
      user: ctx.user,
    },
  });
});

export function createRateLimiterMiddleware(name: string, limiter: Limiter, message?: string) {
  return middleware(async opts => {
    const { ctx } = opts;

    if (ctx.user == null) {
      throw new TRPCError({ code: 'UNAUTHORIZED' })
    }

    const rateLimiter = createRateLimiter(name, limiter);
    const rateLimitResult = await rateLimiter.limit(ctx.user.id);

    if (rateLimitResult.success === false) {
      console.error(`Too many requests from user: ${ctx.user.id}`);
      throw new TRPCError({ code: 'TOO_MANY_REQUESTS', message });
    }

    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  })
}

// 5 requests per 5 seconds
export const isRateLimited = createRateLimiterMiddleware("default", Ratelimit.slidingWindow(5, "5 s"))

// 10 tokens each 15 minutes
export const isPromptImprovementRateLimited =
  createRateLimiterMiddleware("prompt", Ratelimit.tokenBucket(10, "15 m", 10), "You have done too much prompts improvements")

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/**
 * Protected procedure (require user to be authenticated)
 */
export const protectedProcedure = publicProcedure.use(isAuthenticated);
