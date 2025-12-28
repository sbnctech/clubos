/**
 * Wild Apricot Adapter Types
 *
 * Re-exports and extends types from the importing module.
 * This is the canonical location for WA types in the adapter pattern.
 */

// Re-export all types from the importer (canonical source)
export type {
  // Authentication
  WATokenResponse,
  WAPermission,
  // Contacts/Members
  WAContact,
  WAContactStatus,
  WAMembershipLevelRef,
  WAFieldValue,
  WAMembershipLevel,
  // Events
  WAEvent,
  WAEventAccessLevel,
  WAEventDetails,
  WAEventOrganizer,
  WAEventRegistrationType,
  // Registrations
  WAEventRegistration,
  WARegistrationStatus,
  WAEventRef,
  WAContactRef,
  WARegistrationTypeRef,
  WAGuestSummary,
  // Invoices
  WAInvoice,
  WAInvoiceStatus,
  // API Response Wrappers
  WAPaginatedResponse,
  WAAsyncQueryResponse,
  WAAsyncQueryResult,
  // Errors
  WAApiError,
  // Sync Types
  SyncStats,
  RegistrationDiagnostics,
  SyncResult,
  SyncError,
  SyncReport,
  SyncWarning,
} from "@/lib/importing/wildapricot/types";

// Re-export exception classes for instanceof checks (value exports)
export {
  WAApiException,
  WAAsyncQueryException,
  WATokenException,
} from "@/lib/importing/wildapricot/types";

/**
 * WA Auth Token with expiration tracking
 */
export interface WAAuthToken {
  accessToken: string;
  tokenType: string;
  expiresAt: Date;
  refreshToken?: string;
  accountId: number;
}

/**
 * Generic WA API response wrapper
 */
export interface WAApiResponse<T> {
  data: T;
  status: number;
  headers?: Record<string, string>;
}

/**
 * WA Member representation for adapter layer
 * Normalized version of WAContact for internal use
 */
export interface WAMember {
  waId: number;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  membershipLevel: string | null;
  membershipLevelId: number | null;
  status: string;
  memberSince: Date | null;
  renewalDue: Date | null;
  isSuspended: boolean;
  isAdmin: boolean;
  balance: number;
  customFields: Record<string, unknown>;
}

/**
 * Adapter service status
 */
export interface WAAdapterStatus {
  connected: boolean;
  lastSync: Date | null;
  lastError: string | null;
  accountId: number | null;
}
