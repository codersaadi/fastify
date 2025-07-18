import { env } from '@/config/env';

import { GoogleOptions } from 'better-auth/social-providers';

const google = {
  clientId: env.GOOGLE_CLIENT_ID as string,
  clientSecret: env.GOOGLE_CLIENT_SECRET as string
} satisfies GoogleOptions;
export { google };
