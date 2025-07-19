import { env } from '@/config/env';

import type { GitlabOptions } from 'better-auth/social-providers';

export const gitlab: GitlabOptions = {
  clientId: env.GITLAB_CLIENT_ID!,
  clientSecret: env.GITLAB_CLIENT_SECRET!,
  issuer : env.GITLAB_ISSUER!,
};
