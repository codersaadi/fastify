import { env } from '@/config/env';

import { LinkedInOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/linkedin
export const linkedin: LinkedInOptions = {
  clientId: env.LINKEDIN_CLIENT_ID!,
  clientSecret: env.LINKEDIN_CLIENT_SECRET!
};
