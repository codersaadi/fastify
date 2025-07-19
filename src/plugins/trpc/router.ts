import { createTRPCRouter } from "@/plugins/trpc/trpc";
import { trpcHealthRoute } from "@/routers/health";

export const appRouter = createTRPCRouter({
    health : trpcHealthRoute()
})

export type AppRouter = typeof appRouter