import { env } from '@/config/env.js';

import { apple } from './apple.js';
import { discord } from './discord.js';
import { dropbox } from './dropbox.js';
import { facebook } from './facebook.js';
import { github } from './github.js';
import { gitlab } from './gitlab.js';
import { google } from './google.js';
import { kick } from './kick.js';
import { linkedin } from './linkedin.js';
import { microsoft } from './microsoft.js';
import { reddit } from './reddit.js';
import { tiktok } from './tiktok.js';
import { twitch } from './twitch.js';
import { twitter } from './twitter.js';
import { zoom } from './zoom.js';
import { spotify } from './spotify.js';
import { roblox } from './roblox.js';

export const allProviders = {
  google,
  github,
  facebook,
  apple,
  discord,
  twitter,
  zoom,
  kick,
  dropbox,
  gitlab,
  linkedin,
  tiktok,
  twitch,
  reddit,
  microsoft,
  spotify,
  roblox
} as const;

export type ProviderName = keyof typeof allProviders;
export type ProviderConfig = typeof allProviders[ProviderName];

export type AuthProvider = {
  name: ProviderName;
  config: ProviderConfig;
};

export class AuthConfigError extends Error {
  constructor (message: string) {
    super(message);
    this.name = 'AuthConfigError';
  }
}

const parseAuthProviders = (providerString?: string): ProviderName[] => {
  if (!providerString) {
    return [];
  }

  const providers = providerString
    .split(',')
    .map((provider) => provider.trim().toLowerCase() as ProviderName)
    .filter((provider) => provider.length > 0);

  // Validate that all providers are supported
  const supportedProviders = Object.keys(allProviders) as ProviderName[];
  const unsupportedProviders = providers.filter((provider) => !supportedProviders.includes(provider));

  if (unsupportedProviders.length > 0) {
    throw new AuthConfigError(`Unsupported auth providers: ${unsupportedProviders.join(', ')}. ` +
      `Supported providers: ${supportedProviders.join(', ')}`);
  }

  return providers;
};

export const getAuthProviders = (): Record<string ,ProviderConfig> => {
  const enabledProviderNames = parseAuthProviders(env.AUTH_PROVIDERS);

  if (enabledProviderNames.length === 0) {
    return {};
  }

  const providers: AuthProvider[] = [];

  for (const providerName of enabledProviderNames) {
    const providerConfig = allProviders[providerName];

    // Validate that required credentials are present
    if (!providerConfig.clientId || !providerConfig.clientSecret) {
      throw new AuthConfigError(`Missing credentials for ${providerName} provider. ` +
        `Please set ${providerName.toUpperCase()}_CLIENT_ID and ${providerName.toUpperCase()}_CLIENT_SECRET`);
    }

    providers.push({
      name: providerName,
      config: providerConfig
    });
  }

  return providers.reduce((acc, { name, config }) => {
    acc[name] = config;
    return acc;
  }, {} as Record<string, ProviderConfig>)
}

export const getEnabledProviderNames = (): ProviderName[] => {
  return parseAuthProviders(env.AUTH_PROVIDERS);
};

export const isProviderEnabled = (providerName: ProviderName): boolean => {
  const enabledProviders = getEnabledProviderNames();
  return enabledProviders.includes(providerName);
};

// Utility to get a specific provider config
export const getProviderConfig = <T extends ProviderName>(
  providerName: T
): ProviderConfig | null => {
  if (!isProviderEnabled(providerName)) {
    return null;
  }
  return allProviders[providerName];
};
