import { env } from '@/config/env';

import { GithubOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/github
export const github: GithubOptions = {
  clientId: env.GITHUB_CLIENT_ID!,
  clientSecret: env.GITHUB_CLIENT_SECRET!
};
