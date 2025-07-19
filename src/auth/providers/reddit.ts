import { env } from '@/config/env';

import type { RedditOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/reddit
export const reddit: RedditOptions = {
  clientId: env.REDDIT_CLIENT_ID!,
  clientSecret: env.REDDIT_CLIENT_SECRET!
};
