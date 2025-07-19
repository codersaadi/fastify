import { RobloxOptions } from "better-auth/social-providers";

// https://www.better-auth.com/docs/authentication/roblox
export const roblox : RobloxOptions = {
    clientId: process.env.ROBLOX_CLIENT_ID as string,
    clientSecret: process.env.ROBLOX_CLIENT_SECRET as string,
}