import { env } from '@/config/env';

import { LinkedInOptions } from 'better-auth/social-providers';

export const linkedin: LinkedInOptions = {
  clientId: env.LINKEDIN_CLIENT_ID!,
  clientSecret: env.LINKEDIN_CLIENT_SECRET!
};
