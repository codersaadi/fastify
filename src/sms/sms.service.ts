import { env } from '@/config/env';

/**
 * SMS Service Configuration
 */
export interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'custom';
  // Twilio specific
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  // AWS SNS specific
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
}

/**
 * SMS Message Interface
 */
export interface SMSMessage {
  to: string;
  body: string;
  from?: string | undefined;
}

/**
 * SMS Service Response
 */
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Abstract SMS Provider
 */
abstract class SMSProvider {
  abstract sendSMS (message: SMSMessage): Promise<SMSResponse>;
}

/**
 * Twilio SMS Provider
 */
class TwilioSMSProvider extends SMSProvider {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor (config: SMSConfig) {
    super();
    if (!config.twilioAccountSid || !config.twilioAuthToken || !config.twilioPhoneNumber) {
      throw new Error('Twilio configuration is incomplete');
    }
    this.accountSid = config.twilioAccountSid;
    this.authToken = config.twilioAuthToken;
    this.fromNumber = config.twilioPhoneNumber;
  }

  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');

      const body = new URLSearchParams({
        To: message.to,
        From: message.from || this.fromNumber,
        Body: message.body
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const data = await response.json() as { sid?: string; message?: string };

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || 'Failed to send SMS via Twilio'
        };
      }

      return {
        success: true,
        messageId: data?.sid || 'no message id found'
      };
    } catch (error) {
      console.error('[Twilio SMS] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * AWS SNS SMS Provider
 */
class AWSSNSSMSProvider extends SMSProvider {
  private accessKeyId: string;
  private secretAccessKey: string;
  private region: string;

  constructor (config: SMSConfig) {
    super();
    if (!config.awsAccessKeyId || !config.awsSecretAccessKey || !config.awsRegion) {
      throw new Error('AWS SNS configuration is incomplete');
    }
    this.accessKeyId = config.awsAccessKeyId;
    this.secretAccessKey = config.awsSecretAccessKey;
    this.region = config.awsRegion;
  }

  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      // AWS SNS API implementation
      const timestamp = new Date().toISOString()
        .replace(/[:\-]|\.\d{3}/g, '');
      const date = timestamp.substr(0, 8);

      const params = new URLSearchParams({
        Action: 'Publish',
        PhoneNumber: message.to,
        Message: message.body,
        Version: '2010-03-31'
      });

      const url = `https://sns.${this.region}.amazonaws.com/`;

      // Note: This is a simplified implementation.
      // For production, consider using the official AWS SDK
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // AWS Signature V4 would be required here for actual implementation
        },
        body: params.toString()
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'Failed to send SMS via AWS SNS'
        };
      }

      return {
        success: true,
        messageId: `aws-sns-${Date.now()}`
      };
    } catch (error) {
      console.error('[AWS SNS SMS] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * Custom SMS Provider (for webhook-based services or custom implementations)
 */
class CustomSMSProvider extends SMSProvider {
  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      // Custom implementation - could be a webhook, third-party service, etc.
      console.log(`[Custom SMS] Would send SMS to ${message.to}: ${message.body}`);

      // TODO: Implement your custom SMS logic here
      // Example: webhook to your custom SMS service
      // const response = await fetch('https://your-sms-webhook.com/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(message),
      // });

      return {
        success: true,
        messageId: `custom-${Date.now()}`
      };
    } catch (error) {
      console.error('[Custom SMS] Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

/**
 * SMS Service Factory
 */
class SMSService {
  private provider: SMSProvider;
  private config: SMSConfig;

  constructor (config?: SMSConfig) {
    this.config = config || this.getConfigFromEnv();
    this.provider = this.createProvider();
  }

  private getConfigFromEnv (): SMSConfig {
    return {
      provider: env.SMS_PROVIDER || 'custom',
      twilioAccountSid: env.TWILIO_ACCOUNT_SID ?? '',
      twilioAuthToken: env.TWILIO_AUTH_TOKEN ?? '',
      twilioPhoneNumber: env.TWILIO_PHONE_NUMBER ?? ''
      // AWS SNS config would be added here when needed
      // awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
      // awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      // awsRegion: env.AWS_REGION,
    };
  }

  private createProvider (): SMSProvider {
    switch (this.config.provider) {
      case 'twilio':
        return new TwilioSMSProvider(this.config);
      case 'aws-sns':
        return new AWSSNSSMSProvider(this.config);
      case 'custom':
      default:
        return new CustomSMSProvider();
    }
  }

  /**
   * Send an SMS message
   */
  async sendSMS (to: string, body: string, from?: string): Promise<SMSResponse> {
    // Validate phone number format (basic validation)
    if (!this.isValidPhoneNumber(to)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    // Rate limiting could be implemented here
    // if (this.isRateLimited(to)) {
    //   return { success: false, error: 'Rate limit exceeded' };
    // }

    return await this.provider.sendSMS({ to, body, from });
  }

  /**
   * Send OTP SMS (convenience method for auth)
   */
  async sendOTP (phoneNumber: string, code: string): Promise<SMSResponse> {
    const message = `Your verification code is: ${code}. This code expires in 10 minutes.`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Basic phone number validation
   */
  private isValidPhoneNumber (phoneNumber: string): boolean {
    // Basic E.164 format validation (international format)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Get provider info
   */
  getProviderInfo () {
    return {
      provider: this.config.provider,
      configured: this.isConfigured()
    };
  }

  /**
   * Check if the service is properly configured
   */
  private isConfigured (): boolean {
    switch (this.config.provider) {
      case 'twilio':
        return !!(this.config.twilioAccountSid && this.config.twilioAuthToken && this.config.twilioPhoneNumber);
      case 'aws-sns':
        return !!(this.config.awsAccessKeyId && this.config.awsSecretAccessKey && this.config.awsRegion);
      case 'custom':
        return true; // Custom provider can always be "configured"
      default:
        return false;
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();

// Export classes for testing or custom implementations
export {
  SMSService,
  TwilioSMSProvider,
  AWSSNSSMSProvider,
  CustomSMSProvider
};
