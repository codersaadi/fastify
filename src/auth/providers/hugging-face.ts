import { env } from '@/config/env';

import { HuggingFaceOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/huggingface
export const huggingFace: HuggingFaceOptions = {
  clientId: env.HUGGING_FACE_CLIENT_ID!,
  clientSecret: env.HUGGING_FACE_CLIENT_SECRET!
};
// REDIRECT_URL : e.g http://localhost:3000/api/auth/callback/huggingface for local development. For production, you should set it to the URL of your application.


