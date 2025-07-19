import { env } from '@/config/env';

import { SpotifyOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/spotify
export const spotify: SpotifyOptions = {
  clientId: env.SPOTIFY_CLIENT_ID as string,
  clientSecret: env.SPOTIFY_CLIENT_SECRET as string
};
