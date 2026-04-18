import { createRateLimitDirective } from "graphql-rate-limit";

const rateLimit = createRateLimitDirective({
  identifyContext: (ctx) => {
    if (ctx.user?.id) return ctx.user.id;
    return ctx.req?.ip || "anonymous";
  },
});

export const rateLimitDirectiveTypeDefs =
  rateLimit?.typeDefs || rateLimit?.rateLimitDirectiveTypeDefs;

export const rateLimitDirectiveTransformer =
  rateLimit?.transformer || rateLimit?.rateLimitDirectiveTransformer;
