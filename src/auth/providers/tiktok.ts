import { env } from '@/config/env';

import type { TiktokOptions } from 'better-auth/social-providers';
// https://www.better-auth.com/docs/authentication/tiktok
export const tiktok: TiktokOptions = {
  clientId: env.TIKTOK_CLIENT_ID!,
  clientSecret: env.TIKTOK_CLIENT_SECRET!,
  clientKey: env.TIKTOK_CLIENT_KEY!
};

//
// The TikTok API does not work with localhost. You need to use a public domain for the redirect URL
// HTTPS for local testing. You can use NGROK or another similar tool for this.
// For testing, you will need to use the Sandbox mode, which you can enable in the TikTok Developer Portal.
// The default scope is user.info.profile. For additional scopes, refer to the Available Scopes documentation.
//
// Make sure to set the redirect URL to a valid HTTPS domain for local development. For production, you should set it to the URL of your application. If you change the base path of the auth routes, you should update the redirect URL accordingly.
//
// The TikTok API does not provide email addresses.
// As a workaround, this implementation uses the user's username value for the email field
// which is why it requires the user.info.profile scope instead of just user.info.basic.
// For production use :
// you will need to request approval from TikTok for the scopes you intend to use.
//
//
