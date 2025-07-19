import { env } from '@/config/env';

import { ZoomOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/zoom
export const zoom = {
  clientId: env.ZOOM_CLIENT_ID!,
  clientSecret: env.ZOOM_CLIENT_SECRET!
} satisfies ZoomOptions;
