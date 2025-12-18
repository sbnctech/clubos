/**
 * Wild Apricot Importer Configuration
 *
 * All configuration values for the WA API client and import process.
 */

export interface WAConfig {
  // API endpoints
  apiBaseUrl: string;
  authUrl: string;

  // Account credentials
  accountId: string;
  apiKey: string;

  // Pagination
  pageSize: number;

  // Async query polling
  asyncPollIntervalMs: number;
  asyncMaxAttempts: number;

  // Request timeouts
  requestTimeoutMs: number;

  // Token management
  tokenExpiryBufferMs: number;

  // Retry configuration
  maxRetries: number;
  retryBaseDelayMs: number;
  retryMaxDelayMs: number;

  // Incremental sync lookback periods
  contactsLookbackDays: number;
  eventsLookbackDays: number;

  // Batch sizes for database operations
  dbBatchSize: number;
}

/**
 * Load configuration from environment variables.
 * Throws if required variables are missing.
 */
export function loadWAConfig(): WAConfig {
  const apiKey = process.env.WA_API_KEY;
  const accountId = process.env.WA_ACCOUNT_ID;

  if (!apiKey) {
    throw new Error("FATAL: WA_API_KEY environment variable is required");
  }

  if (!accountId) {
    throw new Error("FATAL: WA_ACCOUNT_ID environment variable is required");
  }

  return {
    // API endpoints
    apiBaseUrl: process.env.WA_API_BASE_URL || "https://api.wildapricot.org/v2.2",
    authUrl: process.env.WA_AUTH_URL || "https://oauth.wildapricot.org/auth/token",

    // Account credentials
    accountId,
    apiKey,

    // Pagination - WA default is 100, max is 500
    pageSize: parseInt(process.env.WA_PAGE_SIZE || "100", 10),

    // Async query polling
    asyncPollIntervalMs: parseInt(process.env.WA_ASYNC_POLL_INTERVAL_MS || "3000", 10),
    asyncMaxAttempts: parseInt(process.env.WA_ASYNC_MAX_ATTEMPTS || "40", 10),

    // Request timeouts
    requestTimeoutMs: parseInt(process.env.WA_REQUEST_TIMEOUT_MS || "30000", 10),

    // Token management - refresh 5 minutes before expiry
    tokenExpiryBufferMs: parseInt(process.env.WA_TOKEN_EXPIRY_BUFFER_MS || "300000", 10),

    // Retry configuration
    maxRetries: parseInt(process.env.WA_MAX_RETRIES || "3", 10),
    retryBaseDelayMs: parseInt(process.env.WA_RETRY_BASE_DELAY_MS || "1000", 10),
    retryMaxDelayMs: parseInt(process.env.WA_RETRY_MAX_DELAY_MS || "60000", 10),

    // Incremental sync lookback
    contactsLookbackDays: parseInt(process.env.WA_CONTACTS_LOOKBACK_DAYS || "1", 10),
    eventsLookbackDays: parseInt(process.env.WA_EVENTS_LOOKBACK_DAYS || "730", 10), // 2 years

    // Database batch size
    dbBatchSize: parseInt(process.env.WA_DB_BATCH_SIZE || "100", 10),
  };
}

/**
 * Check if running in dry run mode.
 */
export function isDryRun(): boolean {
  return process.env.DRY_RUN === "1";
}

/**
 * Check if production import is allowed.
 * Returns false in production unless explicitly enabled.
 */
export function isProductionImportAllowed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }
  return process.env.ALLOW_PROD_IMPORT === "1";
}

/**
 * Validate production safety checks.
 * Throws if attempting production import without explicit opt-in.
 */
export function validateProductionSafety(): void {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PROD_IMPORT) {
    throw new Error(
      "FATAL: Production import requires ALLOW_PROD_IMPORT=1 environment variable"
    );
  }
}

/**
 * Get the system actor for audit logging.
 */
export function getSystemActor() {
  return {
    email: "system@wa-import",
    globalRole: "system" as const,
    memberId: null as unknown as string, // System actor has no member ID
  };
}
