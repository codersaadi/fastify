import { env } from '@/config/env';

import { TwitterOption as TwiiterOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/twitter
export const twitter: TwiiterOptions = {
  clientId: env.TWITTER_CLIENT_ID!,
  clientSecret: env.TWITTER_CLIENT_SECRET!
};
