import { createRateLimitDirective } from "graphql-rate-limit";

export const rateLimitDirective = createRateLimitDirective({
  identifyContext: (ctx) => {
    if (ctx.user?.id) return ctx.user.id;

    return ctx.req?.ip || "anonymous";
  },
});
