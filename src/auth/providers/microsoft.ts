import { env } from '@/config/env';

import type { MicrosoftOptions } from 'better-auth/social-providers';

export const microsoft: MicrosoftOptions = {
  clientId: env.MICROSOFT_CLIENT_ID!,
  clientSecret: env.MICROSOFT_CLIENT_SECRET!
};
