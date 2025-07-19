import { createHash } from 'crypto';

import { env } from '@/config/env';

import { SNSClient, PublishCommand, PublishCommandInput } from '@aws-sdk/client-sns';
import Twilio from 'twilio';

/**
 * SMS Service Configuration
 */
export interface SMSConfig {
  provider: 'twilio' | 'aws-sns' | 'custom';
  // Rate limiting
  rateLimitWindowMs?: number;
  rateLimitMaxAttempts?: number;
  // Twilio specific
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  // AWS SNS specific
  awsAccessKeyId?: string;
  awsSecretAccessKey?: string;
  awsRegion?: string;
  // Custom webhook
  customWebhookUrl?: string;
  customWebhookApiKey?: string;
}

/**
 * SMS Message Interface
 */
export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
  templateId?: string;
  templateParams?: Record<string, string>;
}

/**
 * SMS Service Response
 */
export interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  retryAfter?: number; // seconds to wait before retry
  cost?: number; // estimated cost in cents
}

/**
 * Rate Limiting Store Interface
 */
interface RateLimitStore {
  get(key: string): Promise<number>;
  set(key: string, count: number, ttl: number): Promise<void>;
  increment(key: string, ttl: number): Promise<number>;
}

/**
 * In-Memory Rate Limit Store (use Redis in production)
 */
class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; expiry: number }>();

  async get (key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiry) {
      this.store.delete(key);
      return 0;
    }
    return entry.count;
  }

  async set (key: string, count: number, ttl: number): Promise<void> {
    this.store.set(key, {
      count,
      expiry: Date.now() + (ttl * 1000)
    });
  }

  async increment (key: string, ttl: number): Promise<number> {
    const current = await this.get(key);
    const newCount = current + 1;
    await this.set(key, newCount, ttl);
    return newCount;
  }
}

/**
 * Logger Interface
 */
interface Logger {
  info(message: string, meta?: unknown): void;
  error(message: string, meta?: unknown): void;
  warn(message: string, meta?: unknown): void;
}

/**
 * Console Logger Implementation
 */
class ConsoleLogger implements Logger {
  info (message: string, meta?: unknown): void {
    console.info(`[SMS Service] ${message}`, meta || '');
  }

  error (message: string, meta?: unknown): void {
    console.error(`[SMS Service] ${message}`, meta || '');
  }

  warn (message: string, meta?: unknown): void {
    console.warn(`[SMS Service] ${message}`, meta || '');
  }
}

/**
 * Abstract SMS Provider
 */
abstract class SMSProvider {
  protected logger: Logger;

  constructor (logger: Logger = new ConsoleLogger()) {
    this.logger = logger;
  }

  abstract sendSMS (message: SMSMessage): Promise<SMSResponse>;
  abstract validateConfig (): boolean;
  abstract getEstimatedCost (message: SMSMessage): number;
}

/**
 * Twilio SMS Provider (Official SDK)
 */
class TwilioSMSProvider extends SMSProvider {
  private client: Twilio.Twilio;
  private fromNumber: string;

  constructor (config: SMSConfig, logger?: Logger) {
    super(logger);

    this.client = Twilio(config.twilioAccountSid!, config.twilioAuthToken!);
    this.fromNumber = config.twilioPhoneNumber!;
  }

  validateConfig (): boolean {
    return !!this.client && !!this.fromNumber;
  }

  getEstimatedCost (message: SMSMessage): number {
    // Twilio pricing: ~$0.0075 per SMS in US (adjust based on destination)
    const baseRate = 0.75; // cents
    const segments = Math.ceil(message.body.length / 160);
    return baseRate * segments;
  }

  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      this.logger.info('Sending SMS via Twilio', {
        to: this.maskPhoneNumber(message.to),
        bodyLength: message.body.length
      });

      const twilioMessage = await this.client.messages.create({
        body: message.body,
        from: message.from || this.fromNumber,
        to: message.to
      });

      const cost = this.getEstimatedCost(message);

      this.logger.info('SMS sent successfully via Twilio', {
        messageId: twilioMessage.sid,
        status: twilioMessage.status,
        cost
      });

      return {
        success: true,
        messageId: twilioMessage.sid,
        cost
      };
    } catch (error) {
      this.logger.error('Failed to send SMS via Twilio', error);

      if (error instanceof Error && 'code' in error) {
        const twilioError = error as { code: number; message: string };
        return {
          success: false,
          error: `Twilio Error ${twilioError?.code}: ${twilioError?.message}`,
          retryAfter: this.shouldRetry(twilioError?.code) ? 30 : 0
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Twilio error'
      };
    }
  }

  private shouldRetry (errorCode: number): boolean {
    // Retry on rate limits and temporary failures
    const retryableCodes = [
      20003,
      20429,
      30001,
      30002,
      30003
    ];
    return retryableCodes.includes(errorCode);
  }

  private maskPhoneNumber (phone: string): string {
    if (phone.length > 6) {
      return phone.slice(0, 3) + '***' + phone.slice(-4);
    }
    return '***';
  }
}

/**
 * AWS SNS SMS Provider (Official SDK)
 */
class AWSSNSSMSProvider extends SMSProvider {
  private client: SNSClient;

  constructor (config: SMSConfig, logger?: Logger) {
    super(logger);

    this.client = new SNSClient({
      region: config.awsRegion!,
      credentials: {
        accessKeyId: config.awsAccessKeyId!,
        secretAccessKey: config.awsSecretAccessKey!
      }
    });
  }

  validateConfig (): boolean {
    return !!this.client;
  }

  getEstimatedCost (_message: SMSMessage): number {
    // AWS SNS pricing: ~$0.0075 per SMS in US
    return 0.75; // cents
  }

  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      this.logger.info('Sending SMS via AWS SNS', {
        to: this.maskPhoneNumber(message.to),
        bodyLength: message.body.length
      });

      const params: PublishCommandInput = {
        PhoneNumber: message.to,
        Message: message.body,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional'
          }
        }
      };

      const command = new PublishCommand(params);
      const result = await this.client.send(command);

      const cost = this.getEstimatedCost(message);

      this.logger.info('SMS sent successfully via AWS SNS', {
        messageId: result.MessageId,
        cost
      });

      return {
        success: true,
        messageId: result.MessageId ?? '',
        cost
      };
    } catch (error) {
      this.logger.error('Failed to send SMS via AWS SNS', error);

      if (error instanceof Error && 'name' in error) {
        const awsError = error as { name: string; message: string };
        return {
          success: false,
          error: `AWS SNS Error: ${awsError?.name} - ${awsError?.message}`,
          retryAfter: this.shouldRetry(awsError.name) ? 60 : 0
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AWS SNS error'
      };
    }
  }

  private shouldRetry (errorName: string): boolean {
    const retryableErrors = [
      'Throttling',
      'InternalError',
      'ServiceUnavailable'
    ];
    return retryableErrors.includes(errorName);
  }

  private maskPhoneNumber (phone: string): string {
    if (phone.length > 6) {
      return phone.slice(0, 3) + '***' + phone.slice(-4);
    }
    return '***';
  }
}

/**
 * Custom SMS Provider (for webhook-based services)
 */
class CustomSMSProvider extends SMSProvider {
  private webhookUrl: string;
  private apiKey?: string;

  constructor (config: SMSConfig, logger?: Logger) {
    super(logger);

    this.webhookUrl = config.customWebhookUrl ?? '';
    this.apiKey = config.customWebhookApiKey ?? '';
  }

  validateConfig (): boolean {
    return typeof this.webhookUrl === 'string' && this.webhookUrl.length > 0;
  }

  getEstimatedCost (_message: SMSMessage): number {
    // Custom provider cost - adjust as needed
    return 1.0; // cents
  }

  async sendSMS (message: SMSMessage): Promise<SMSResponse> {
    try {
      if (!this.webhookUrl) {
        this.logger.warn('Custom SMS provider: No webhook URL configured, logging message only');
        this.logger.info(`[Custom SMS] Would send to ${this.maskPhoneNumber(message.to)}: ${message.body}`);

        return {
          success: true,
          messageId: `custom-mock-${Date.now()}`
        };
      }

      const payload = {
        to: message.to,
        body: message.body,
        from: message.from,
        timestamp: new Date().toISOString()
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'SMS-Service/1.0'
      };

      if (this.apiKey) {
        headers.Authorization = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000) // 10s timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      const cost = this.getEstimatedCost(message);

      return {
        success: true,
        messageId: (result as { messageId: string }).messageId || `custom-${Date.now()}`,
        cost
      };
    } catch (error) {
      this.logger.error('Failed to send SMS via custom provider', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown custom provider error',
        retryAfter: 30
      };
    }
  }

  private maskPhoneNumber (phone: string): string {
    if (phone.length > 6) {
      return phone.slice(0, 3) + '***' + phone.slice(-4);
    }
    return '***';
  }
}

/**
 * Production-Ready SMS Service
 */
export class SMSService {
  private provider: SMSProvider;
  private config: SMSConfig;
  private rateLimitStore: RateLimitStore;
  private logger: Logger;

  constructor (
    config?: SMSConfig,
    rateLimitStore?: RateLimitStore,
    logger?: Logger
  ) {
    this.logger = logger || new ConsoleLogger();
    this.config = config || this.getConfigFromEnv();
    this.rateLimitStore = rateLimitStore || new InMemoryRateLimitStore();
    this.provider = this.createProvider();

    this.logger.info('SMS Service initialized', {
      provider: this.config.provider,
      configured: this.provider.validateConfig()
    });
  }

  private getConfigFromEnv (): SMSConfig {
    return {
      provider: (env.SMS_PROVIDER as unknown as 'twilio' | 'aws-sns' | 'custom') || 'custom',
      rateLimitWindowMs: env.SMS_RATE_LIMIT_WINDOW_MS, // 1 hour
      rateLimitMaxAttempts: env.SMS_RATE_LIMIT_MAX_ATTEMPTS,
      // Twilio
      twilioAccountSid: env.TWILIO_ACCOUNT_SID!,
      twilioAuthToken: env.TWILIO_AUTH_TOKEN!,
      twilioPhoneNumber: env.TWILIO_PHONE_NUMBER!,
      // AWS SNS
      awsAccessKeyId: env.AWS_ACCESS_KEY_ID!,
      awsSecretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      awsRegion: env.AWS_REGION!,
      // Custom
      customWebhookUrl: env.SMS_CUSTOM_WEBHOOK_URL!,
      customWebhookApiKey: env.SMS_CUSTOM_API_KEY!
    };
  }

  private createProvider (): SMSProvider {
    switch (this.config.provider) {
      case 'twilio':
        return new TwilioSMSProvider(this.config, this.logger);
      case 'aws-sns':
        return new AWSSNSSMSProvider(this.config, this.logger);
      case 'custom':
      default:
        return new CustomSMSProvider(this.config, this.logger);
    }
  }

  /**
   * Send an SMS message with full validation and rate limiting
   */
  async sendSMS (to: string, body: string, from?: string): Promise<SMSResponse> {
    try {
      // Validate inputs
      const validation = this.validateMessage(to, body);
      if (!validation.valid) {
        return { success: false, error: validation.error ?? '' };
      }

      // Check rate limiting
      const rateLimitResult = await this.checkRateLimit(to);
      if (!rateLimitResult.allowed) {
        this.logger.warn('Rate limit exceeded', { to: this.maskPhoneNumber(to) });
        return {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter ?? 0
        };
      }

      // Check provider configuration
      if (!this.provider.validateConfig()) {
        return {
          success: false,
          error: 'SMS service is not properly configured'
        };
      }

      // Send the message
      const message: SMSMessage = { to, body, from: from ?? '' };
      const result = await this.provider.sendSMS(message);

      // Log the attempt
      this.logger.info('SMS send attempt completed', {
        success: result.success,
        provider: this.config.provider,
        cost: result.cost,
        hasError: !!result.error
      });

      return result;
    } catch (error) {
      this.logger.error('Unexpected error in sendSMS', error);
      return {
        success: false,
        error: 'Internal service error'
      };
    }
  }

  /**
   * Send OTP SMS with enhanced security
   */
  async sendOTP (
    phoneNumber: string,
    code: string,
    expiryMinutes: number = 10,
    templateParams?: Record<string, string>
  ): Promise<SMSResponse> {
    const message = this.formatOTPMessage(code, expiryMinutes, templateParams);

    // Add additional rate limiting for OTP (stricter)
    const otpRateLimitKey = `otp:${this.hashPhoneNumber(phoneNumber)}`;
    const otpCount = await this.rateLimitStore.get(otpRateLimitKey);

    if (otpCount >= 3) { // Max 3 OTPs per hour
      return {
        success: false,
        error: 'Too munknown OTP requests. Please try again later.',
        retryAfter: 3600
      };
    }

    const result = await this.sendSMS(phoneNumber, message);

    if (result.success) {
      await this.rateLimitStore.increment(otpRateLimitKey, 3600); // 1 hour
    }

    return result;
  }

  /**
   * Validate message content and phone number
   */
  private validateMessage (to: string, body: string): { valid: boolean; error?: string } {
    // Phone number validation (E.164 format)
    if (!this.isValidPhoneNumber(to)) {
      return { valid: false, error: 'Invalid phone number format. Use E.164 format (+1234567890)' };
    }

    // Message body validation
    if (!body || body.trim().length === 0) {
      return { valid: false, error: 'Message body cannot be empty' };
    }

    if (body.length > 1600) { // SMS limit
      return { valid: false, error: 'Message body exceeds maximum length (1600 characters)' };
    }

    // Check for spam indicators
    if (this.containsSpamIndicators(body)) {
      return { valid: false, error: 'Message content not allowed' };
    }

    return { valid: true };
  }

  /**
   * Enhanced phone number validation
   */
  private isValidPhoneNumber (phoneNumber: string): boolean {
    // E.164 format: +[country code][subscriber number]
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Basic spam detection
   */
  private containsSpamIndicators (message: string): boolean {
    const spamPatterns = [
      /click here/i,
      /urgent.{0,10}act now/i,
      /congratulations.{0,20}won/i,
      /free money/i,
      /viagra/i,
      /casino/i
    ];

    return spamPatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit (phoneNumber: string): Promise<{
    allowed: boolean;
    retryAfter?: number;
  }> {
    const key = `sms:${this.hashPhoneNumber(phoneNumber)}`;
    const windowMs = this.config.rateLimitWindowMs || 3600000; // 1 hour
    const maxAttempts = this.config.rateLimitMaxAttempts || 10;

    try {
      const currentCount = await this.rateLimitStore.increment(key, Math.floor(windowMs / 1000));

      if (currentCount > maxAttempts) {
        return {
          allowed: false,
          retryAfter: Math.floor(windowMs / 1000)
        };
      }

      return { allowed: true };
    } catch (error) {
      this.logger.error('Rate limiting check failed', error);
      // Fail open - allow the request if rate limiting fails
      return { allowed: true };
    }
  }

  /**
   * Hash phone number for privacy in logs and rate limiting
   */
  private hashPhoneNumber (phoneNumber: string): string {
    return createHash('sha256').update(phoneNumber)
      .digest('hex')
      .substring(0, 16);
  }

  /**
   * Format OTP message with template support
   */
  private formatOTPMessage (
    code: string,
    expiryMinutes: number,
    templateParams?: Record<string, string>
  ): string {
    let message = `Your verification code is: ${code}. This code expires in ${expiryMinutes} minutes.`;

    if (templateParams?.appName) {
      message = `${templateParams.appName}: ${message}`;
    }

    if (templateParams?.customMessage) {
      message = templateParams.customMessage.replace('{code}', code).replace('{expiry}', expiryMinutes.toString());
    }

    return message;
  }

  /**
   * Mask phone number for logging
   */
  private maskPhoneNumber (phone: string): string {
    if (phone.length > 6) {
      return phone.slice(0, 3) + '***' + phone.slice(-4);
    }
    return '***';
  }

  /**
   * Get service health information
   */
  getHealthInfo () {
    return {
      provider: this.config.provider,
      configured: this.provider.validateConfig(),
      rateLimitingEnabled: !!this.rateLimitStore,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown (): Promise<void> {
    this.logger.info('SMS Service shutting down...');
    // Cleanup unknown resources if needed
  }
}

// Export singleton instance (optional)
export const smsService = new SMSService();

// Export all classes and interfaces
export {
  TwilioSMSProvider,
  AWSSNSSMSProvider,
  CustomSMSProvider,
  InMemoryRateLimitStore,
  ConsoleLogger
};

export type {

  RateLimitStore,
  Logger
};
