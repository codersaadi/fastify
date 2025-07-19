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
import { roblox } from './roblox.js';
import { spotify } from './spotify.js';
import { tiktok } from './tiktok.js';
import { twitch } from './twitch.js';
import { twitter } from './twitter.js';
import { zoom } from './zoom.js';

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



export { getAuthProviders, 
  getEnabledProviderNames,
  getProviderConfig, isProviderEnabled, type AuthConfigError, type AuthProvider } from './provider_helpers.js'