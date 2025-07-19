import { env } from '@/config/env';
import { smsService } from '@/sms/sms.service';
import { phoneNumberValidator } from '@/utils/phone-number';
import { sendEmail } from '@repo/email';
import { AuthEmailTemplate } from '@repo/email/templates/auth-email';

import { BetterAuthPlugin } from 'better-auth';
import {
  admin,
  openAPI,
  phoneNumber,
  magicLink,
  jwt,
  oneTap,
  multiSession,
  emailOTP,
  username
} from 'better-auth/plugins';

/**
 * @file This file configures all authentication plugins for the application.
 * Each plugin is conditionally enabled based on environment variables,
 * allowing for a highly modular and configurable authentication system.
 * @see /src/config/env.ts for environment variable definitions.
 */

/**
 * Core plugins that are always enabled
 */
const corePlugins: BetterAuthPlugin[] = [
  /**
     * [CORE] Admin Plugin
     * Provides core administrative functionalities, including role management
     * and an optional admin UI for user management.
     */
  admin({
    defaultRole: 'user',
    adminEmails: env.ADMIN_EMAILS?.split(',') || [],
    disableAdminUI: env.NODE_ENV === 'production' && !env.ENABLE_ADMIN_UI
  }),

  /**
     * [CORE] OpenAPI Documentation Plugin
     * Automatically generates and serves OpenAPI (Swagger) documentation for your auth routes.
     * Super helpful for API testing and for frontend developers.
     */
  openAPI({
    path: '/api/auth/docs',
    info: {
      title: 'Authentication API',
      version: '1.0.0',
      description: 'A modular, advanced authentication system powered by Better Auth.'
    },
    tags: [
      'Authentication',
      'Users',
      'Sessions',
      'Organizations',
      'Security'
    ]
  })
];

/**
 * Feature plugins with their configurations
 */
const featurePlugins = {
  username: () => username(),

  emailOTP: () => emailOTP({
    async sendVerificationOTP ({ email, otp, type }) {
      switch (type) {
        case 'email-verification':
          // Handle email verification
          break;
        case 'forget-password':
          // Handle password reset
          break;
        case 'sign-in':
          // Handle sign-in
          break;
        default:
          break;
      }
      console.log(`[Email OTP] Sending ${type} OTP to ${email}: ${otp}`);
    },
    allowedAttempts: env.OTP_MAX_ATTEMPTS as number,
    otpLength: env.OTP_LENGTH,
    expiresIn: 60 * (env.OTP_EXPIRY_MINUTES || 5), // 5 minutes
    sendVerificationOnSignUp: false
  }),

  magicLink: () => magicLink({
    async sendMagicLink (data, _req) {
      console.log(`[Magic Link] Sending link to ${data?.email}: ${data?.url}`);
      sendEmail({
        to: data?.email,
        subject: 'Your Magic Sign-In Link',
        from: env.EMAIL_FROM as string,
        react: AuthEmailTemplate({
          type: 'verify',
          link: data?.url,
          username: data.email?.split('@')[0] || data.email
        })
      });
    },
    disableSignUp: env.DISABLE_SIGNUP,
    expiresIn: 60 * (env.MAGIC_LINK_EXPIRY_MINUTES || 15) // 15 minutes
  }),

  oneTap: () => oneTap({
    clientId: env.GOOGLE_CLIENT_ID!,
    disableSignup: env.DISABLE_SIGNUP
  }),

  multiSession: () => multiSession({
    maximumSessions: env.MAX_SESSIONS_PER_USER || 10
  }),

  jwt: () => jwt({
    jwt: {
      issuer: env.JWT_ISSUER as string,
      audience: env.JWT_AUDIENCE as string,
      expirationTime: '15m',
      definePayload (session) {
        return {
          userId: session?.user?.id,
          email: session?.user?.email,
          name: session?.user?.name,
          role: session?.user?.role
        };
      }
    }
  }),

  phoneNumber: () => phoneNumber({
    async sendOTP (data, _req) {
      try {
        console.log(`[Phone Auth] Sending code to ${data.phoneNumber}: ${data.code}`);

        const result = await smsService.sendOTP(data.phoneNumber, data.code);

        if (!result.success) {
          console.error(`[Phone Auth] Failed to send SMS: ${result.error}`);
          throw new Error(result.error || 'Failed to send SMS');
        }

        console.log(`[Phone Auth] SMS sent successfully. Message ID: ${result.messageId}`);
      } catch (error) {
        console.error('[Phone Auth] Error sending SMS:', error);
        throw error;
      }
    },

    async sendPasswordResetOTP (data, _req) {
      console.log(`[Phone Auth] Sending password reset OTP to ${data.phoneNumber}: ${data.code}`);
      const result = await smsService.sendOTP(data.phoneNumber, data.code);

      if (!result.success) {
        console.error(`[Phone Auth] Failed to send SMS: ${result.error}`);
        throw new Error(result.error || 'Failed to send SMS');
      }

      console.log(`[Phone Auth] SMS sent successfully. Message ID: ${result.messageId}`);
    },

    phoneNumberValidator (phoneNumber) {
      const result = phoneNumberValidator(phoneNumber, { defaultCountry: 'US' });
      return result.isValid;
    },

    otpLength: env.PHONE_OTP_LENGTH as number,
    expiresIn: 60 * (env.PHONE_OTP_EXPIRY_MINUTES || 5)
  })
};

/**
 * Plugin configuration mapping environment variables to plugin factories
 */
const pluginConfig = [
  { enabled: env.ENABLE_USERNAME, plugin: featurePlugins.username },
  { enabled: env.ENABLE_OTP, plugin: featurePlugins.emailOTP },
  { enabled: env.ENABLE_MAGIC_LINK, plugin: featurePlugins.magicLink },
  { enabled: env.ENABLE_ONE_TAP, plugin: featurePlugins.oneTap },
  { enabled: env.ENABLE_MULTI_SESSION, plugin: featurePlugins.multiSession },
  { enabled: env.ENABLE_JWT, plugin: featurePlugins.jwt },
  { enabled: env.ENABLE_PHONE_AUTH, plugin: featurePlugins.phoneNumber }
] as const;

/**
 * Build the final plugins array by filtering enabled plugins
 */
export const authPlugins: BetterAuthPlugin[] = [
  ...corePlugins,
  ...pluginConfig
    .filter(({ enabled }) => enabled)
    .map(({ plugin }) => plugin())
] satisfies BetterAuthPlugin[];
