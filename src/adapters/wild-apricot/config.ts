/**
 * Wild Apricot Adapter Configuration
 *
 * Centralizes all WA-specific configuration and environment variables.
 */

import { z } from "zod";

/**
 * Environment variable schema for WA configuration
 */
const waConfigSchema = z.object({
  apiKey: z.string().min(1, "WA_API_KEY is required"),
  accountId: z.coerce.number().positive("WA_ACCOUNT_ID must be a positive number"),
  clientId: z.string().optional(),
  clientSecret: z.string().optional(),
  baseUrl: z.string().url().default("https://api.wildapricot.org"),
  authUrl: z.string().url().default("https://oauth.wildapricot.org"),
  apiVersion: z.string().default("v2.2"),
  timeout: z.coerce.number().positive().default(30000),
  retryAttempts: z.coerce.number().nonnegative().default(3),
  retryDelay: z.coerce.number().nonnegative().default(1000),
});

export type WAConfig = z.infer<typeof waConfigSchema>;

/**
 * Load WA configuration from environment
 * Throws if required variables are missing
 */
export function loadWAConfig(): WAConfig {
  const config = waConfigSchema.parse({
    apiKey: process.env.WA_API_KEY,
    accountId: process.env.WA_ACCOUNT_ID,
    clientId: process.env.WA_CLIENT_ID,
    clientSecret: process.env.WA_CLIENT_SECRET,
    baseUrl: process.env.WA_BASE_URL,
    authUrl: process.env.WA_AUTH_URL,
    apiVersion: process.env.WA_API_VERSION,
    timeout: process.env.WA_TIMEOUT,
    retryAttempts: process.env.WA_RETRY_ATTEMPTS,
    retryDelay: process.env.WA_RETRY_DELAY,
  });

  return config;
}

/**
 * Check if WA adapter is configured
 * Returns false if required env vars are missing (standalone mode)
 */
export function isWAConfigured(): boolean {
  return Boolean(process.env.WA_API_KEY && process.env.WA_ACCOUNT_ID);
}

/**
 * WA API endpoints
 */
export const WA_ENDPOINTS = {
  auth: {
    token: "/auth/token",
  },
  accounts: (accountId: number) => `/accounts/${accountId}`,
  contacts: (accountId: number) => `/accounts/${accountId}/contacts`,
  contact: (accountId: number, contactId: number) =>
    `/accounts/${accountId}/contacts/${contactId}`,
  events: (accountId: number) => `/accounts/${accountId}/events`,
  event: (accountId: number, eventId: number) =>
    `/accounts/${accountId}/events/${eventId}`,
  eventRegistrations: (accountId: number, eventId: number) =>
    `/accounts/${accountId}/events/${eventId}/registrations`,
  membershipLevels: (accountId: number) =>
    `/accounts/${accountId}/membershiplevels`,
} as const;

/**
 * Default sync settings
 */
export const WA_SYNC_DEFAULTS = {
  batchSize: 100,
  asyncQueryPollInterval: 2000,
  asyncQueryTimeout: 300000, // 5 minutes
  contactsPerPage: 500,
  eventsLookbackDays: 365,
  eventsLookaheadDays: 365,
} as const;
