import { env } from '@/config/env';

import { ZoomOptions } from 'better-auth/social-providers';

export const zoom = {
  clientId: env.ZOOM_CLIENT_ID!,
  clientSecret: env.ZOOM_CLIENT_SECRET!
} satisfies ZoomOptions;
