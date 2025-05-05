import { paystackRouter } from "~/server/api/routers/paystack";
import { propertyRouter } from "~/server/api/routers/property";
import { tenantRouter } from "~/server/api/routers/tenant";
import { unitRouter } from "~/server/api/routers/unit";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  paystack: paystackRouter,
  property: propertyRouter,
  tenant: tenantRouter,
  unit: unitRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
