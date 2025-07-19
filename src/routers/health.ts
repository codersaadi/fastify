import { publicProcedure } from "@/plugins/trpc/trpc"

export const trpcHealthRoute = () => publicProcedure.query(()=> {
        return {
            message : "trpc server is working! ok"
        }
    })