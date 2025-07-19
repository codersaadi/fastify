import { env } from '@/config/env';

import type { TiktokOptions } from 'better-auth/social-providers';

export const tiktok: TiktokOptions = {
  clientId: env.TIKTOK_CLIENT_ID!,
  clientSecret: env.TIKTOK_CLIENT_SECRET!,
  clientKey : env.TIKTOK_CLIENT_KEY!
};
