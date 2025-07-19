import { env } from '@/config/env';

import type { MicrosoftOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/microsoft
export const microsoft: MicrosoftOptions = {
  clientId: env.MICROSOFT_CLIENT_ID!,
  clientSecret: env.MICROSOFT_CLIENT_SECRET!
  // (optional)
  // tenantId: 'common',
  // prompt: "select_account", // Forces account selection
};
// REDIRECT_URL in local development : e.g http://localhost:3000/api/auth/callback/microsoft
