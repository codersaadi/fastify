import { env } from '@/config/env';
import type { FacebookOptions } from 'better-auth/social-providers';

export const facebook: FacebookOptions = {
  clientId: env.FACEBOOK_CLIENT_ID!,
  clientSecret: env.FACEBOOK_CLIENT_SECRET!,
};
