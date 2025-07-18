import { env } from '@/config/env';

import type { DropboxOptions } from 'better-auth/social-providers';

export const dropbox: DropboxOptions = {
  clientId: env.DROPBOX_CLIENT_ID!,
  clientSecret: env.DROPBOX_CLIENT_SECRET!
};
