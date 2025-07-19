import { VkOption } from "better-auth/social-providers";
// https://www.better-auth.com/docs/authentication/vk
export const vk = {
        clientId: process.env.VK_CLIENT_ID as string, 
      clientSecret: process.env.VK_CLIENT_SECRET as string, 
} satisfies VkOption