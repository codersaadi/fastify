import { env } from '@/config/env';

import { GoogleOptions } from 'better-auth/social-providers';

const google = {
  clientId: env.GOOGLE_CLIENT_ID as string,
  clientSecret: env.GOOGLE_CLIENT_SECRET as string,
  // if needed
  // prompt: "select_account", 
  // accessType :"offline"
} satisfies GoogleOptions;
export { google };
