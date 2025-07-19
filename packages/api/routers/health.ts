import { publicProcedure } from '../trpc';

export const trpcHealthRoute = () => publicProcedure.query(() => {
  return {
    message: 'trpc server is working! ok'
  };
});
