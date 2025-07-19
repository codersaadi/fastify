import { createTRPCRouter, publicProcedure } from '@/plugins/trpc/trpc';
import { trpcHealthRoute } from '@/routers/health';
export const appRouter = createTRPCRouter({
  health: trpcHealthRoute(),
  random : publicProcedure.subscription(async function* () {
    while (true) {
      yield { randomNumber: Math.random() };
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  })
});

export type AppRouter = typeof appRouter;
