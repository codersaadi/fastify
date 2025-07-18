import { env } from '@/config/env';

import type { TwitchOptions } from 'better-auth/social-providers';

export const twitch: TwitchOptions = {
  clientId: env.TWITCH_CLIENT_ID!,
  clientSecret: env.TWITCH_CLIENT_SECRET!
};
