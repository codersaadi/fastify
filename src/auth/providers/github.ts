import { env } from '@/config/env';

import { GithubOptions } from 'better-auth/social-providers';

export const github: GithubOptions = {
  clientId: env.GITHUB_CLIENT_ID!,
  clientSecret: env.GITHUB_CLIENT_SECRET!
};
