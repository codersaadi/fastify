import { env } from '@/config/env';

import { KickOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/kick
export const kick = {
  clientId: env.KICK_CLIENT_ID!,
  clientSecret: env.KICK_CLIENT_SECRET!

} satisfies KickOptions;
// REDIRECT_URL in local development : e.g http://localhost:3000/api/auth/callback/kick
