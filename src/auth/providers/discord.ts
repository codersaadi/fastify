import { env } from '@/config/env';

import type { DiscordOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/discord
export const discord: DiscordOptions = {
  clientId: env.DISCORD_CLIENT_ID!,
  clientSecret: env.DISCORD_CLIENT_SECRET!
};
