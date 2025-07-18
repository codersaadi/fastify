import { env } from '@/config/env';

import { HuggingFaceOptions } from 'better-auth/social-providers';

export const huggingFace: HuggingFaceOptions = {
  clientId: env.HUGGING_FACE_CLIENT_ID!,
  clientSecret: env.HUGGING_FACE_CLIENT_SECRET!
};
