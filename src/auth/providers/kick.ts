import { env } from '@/config/env';

import { KickOptions } from 'better-auth/social-providers';

export const kick = {
  clientId: env.KICK_CLIENT_ID!,
  clientSecret: env.KICK_CLIENT_SECRET!

} satisfies KickOptions;
