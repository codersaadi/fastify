import { env } from '@/config/env';

import type { DiscordOptions } from 'better-auth/social-providers';

export const discord: DiscordOptions = {
  clientId: env.DISCORD_CLIENT_ID!,
  clientSecret: env.DISCORD_CLIENT_SECRET!
};
