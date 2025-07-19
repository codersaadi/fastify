import { accounts, users, verifications } from "./schema"

export type User = typeof users.$inferSelect
export type Account = typeof accounts.$inferSelect
export type Session = typeof accounts.$inferSelect
export type Verification = typeof verifications.$inferSelect