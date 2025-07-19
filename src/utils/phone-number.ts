import { CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js';

interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber?: string;
  countryCode?: CountryCode;
  nationalNumber?: string;
  phoneType?: string;
  errorMessage?: string;
}

interface PhoneValidatorOptions {
  defaultCountry?: CountryCode;
  strictValidation?: boolean;
  allowedCountries?: CountryCode[];
  blockedCountries?: CountryCode[];
}

class PhoneNumberValidator {
  private options: PhoneValidatorOptions;

  constructor (options: PhoneValidatorOptions = {}) {
    this.options = {
      strictValidation: true,
      ...options
    };
  }

  /**
   * Validates a phone number using libphonenumber-js
   * @param phoneNumber - The phone number string to validate
   * @param options - Optional validation options
   * @returns PhoneValidationResult object
   */
  public validatePhoneNumber (
    phoneNumber: string,
    options?: Partial<PhoneValidatorOptions>
  ): PhoneValidationResult {
    const validationOptions = { ...this.options, ...options };

    try {
      // Input sanitization
      if (!phoneNumber || typeof phoneNumber !== 'string') {
        return {
          isValid: false,
          errorMessage: 'Phone number must be a non-empty string'
        };
      }

      const trimmedNumber = phoneNumber.trim();
      if (trimmedNumber.length === 0) {
        return {
          isValid: false,
          errorMessage: 'Phone number cannot be empty'
        };
      }

      // Parse the phone number
      const parsedNumber = parsePhoneNumberWithError(
        trimmedNumber,
        validationOptions.defaultCountry as CountryCode
      );
      if (!parsedNumber) {
        return {
          isValid: false,
          errorMessage: 'Invalid phone number format'
        };
      }

      // Validate using libphonenumber
      const isValid = parsedNumber.isValid();

      if (!isValid) {
        return {
          isValid: false,
          errorMessage: 'Invalid phone number'
        };
      }

      // Country restrictions
      const countryCode = parsedNumber.country;
      if (!countryCode) {
        return {
          isValid: false,
          errorMessage: 'Invalid phone number, country code not found'
        };
      }
      if (validationOptions.allowedCountries &&
        !validationOptions.allowedCountries.includes(countryCode || '')) {
        return {
          isValid: false,
          errorMessage: `Phone numbers from ${countryCode} are not allowed`
        };
      }

      if (validationOptions.blockedCountries &&
        validationOptions.blockedCountries.includes(countryCode || '')) {
        return {
          isValid: false,
          errorMessage: `Phone numbers from ${countryCode} are blocked`
        };
      }

      return {
        isValid: true,
        formattedNumber: parsedNumber.formatInternational(),
        countryCode,
        nationalNumber: parsedNumber.formatNational(),
        phoneType: parsedNumber.getType() || 'mobile'
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Simple boolean validator (backward compatible)
   */
  public isValidPhoneNumber (phoneNumber: string): boolean {
    return this.validatePhoneNumber(phoneNumber).isValid;
  }
}

// Option 2: Custom validator with regex patterns (fallback approach)
class CustomPhoneValidator {
  private static readonly PATTERNS = {
    // E.164 format
    E164: /^\+[1-9]\d{1,14}$/,

    // Common formats
    US: /^(\+1|1)?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/,
    UK: /^(\+44|0)[1-9]\d{8,9}$/,
    INTERNATIONAL: /^\+(?:[0-9] ?){6,14}[0-9]$/
  };

  public static validateE164 (phoneNumber: string): PhoneValidationResult {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return { isValid: false, errorMessage: 'Invalid input' };
    }

    const cleaned = phoneNumber.replace(/\s/g, '');

    if (this.PATTERNS.E164.test(cleaned)) {
      return {
        isValid: true,
        formattedNumber: cleaned
      };
    }

    return {
      isValid: false,
      errorMessage: 'Phone number must be in E.164 format (+1234567890)'
    };
  }
}

// Factory function for easy instantiation
export function createPhoneValidator (options?: PhoneValidatorOptions): PhoneNumberValidator {
  return new PhoneNumberValidator(options);
}

// Simple function validator (enterprise-ready)
export function phoneNumberValidator (
  phoneNumber: string,
  options: PhoneValidatorOptions = {}
): PhoneValidationResult {
  const validator = new PhoneNumberValidator(options);
  return validator.validatePhoneNumber(phoneNumber);
}

export { PhoneNumberValidator, CustomPhoneValidator };
export type { PhoneValidationResult, PhoneValidatorOptions };
