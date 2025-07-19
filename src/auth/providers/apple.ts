import { env } from '@/config/env';

import type { AppleOptions } from 'better-auth/social-providers';

export const apple: AppleOptions = {
  clientId: env.APPLE_CLIENT_ID!,
  clientSecret: env.APPLE_CLIENT_SECRET!
};

export const trustedOrigins = [
  "https://appleid.apple.com"
]