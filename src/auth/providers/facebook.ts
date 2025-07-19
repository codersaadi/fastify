import { env } from '@/config/env';

import type { FacebookOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/facebook
export const facebook: FacebookOptions = {
  clientId: env.FACEBOOK_CLIENT_ID!,
  // Avoid exposing the clientSecret in client-side code (e.g., frontend apps) because it’s sensitive information.
  clientSecret: env.FACEBOOK_CLIENT_SECRET!
  // scope: ["email", "public_profile", "user_friends"], // Overwrites permissions
  // fields: ["user_friends"], // Extending list of fields

};

//
// For limited login, you need to pass idToken.token, for only accessToken you need to pass idToken.accessToken and idToken.token together because of (#1183)
// [https://github.com/better-auth/better-auth/issues/1183].
//
//
// const data = await authClient.signIn.social({
//     provider: "facebook",
//     idToken: {
//         ...(platform === 'ios' ?
//             { token: idToken }
//             : { token: accessToken, accessToken: accessToken }),
//     },
// })
//
// For a complete list of available permissions, refer to the Permissions Reference.
// https://developers.facebook.com/docs/permissions
//
