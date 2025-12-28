/**
 * Wild Apricot Adapter
 *
 * This module provides all Wild Apricot integration functionality.
 * When running in standalone mode (no WA credentials), this adapter
 * gracefully degrades and is not loaded.
 *
 * @module adapters/wild-apricot
 */

// Configuration
export { loadWAConfig, isWAConfigured, WA_ENDPOINTS, WA_SYNC_DEFAULTS } from "./config";
export type { WAConfig } from "./config";

// Types
export type {
  // Auth
  WAAuthToken,
  WAApiResponse,
  // Members
  WAMember,
  WAContact,
  WAContactStatus,
  WAMembershipLevel,
  WAMembershipLevelRef,
  WAFieldValue,
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
  // API
  WAPaginatedResponse,
  WAAsyncQueryResponse,
  WAAsyncQueryResult,
  WATokenResponse,
  WAApiError,
  // Sync
  SyncStats,
  SyncResult,
  SyncError,
  SyncReport,
  SyncWarning,
  RegistrationDiagnostics,
  // Adapter
  WAAdapterStatus,
} from "./types";

// Exception classes (directly from source to avoid re-export issues)
export {
  WAApiException,
  WAAsyncQueryException,
  WATokenException,
} from "@/lib/importing/wildapricot/types";

// Services
export {
  WAAuthService,
  getWAAuthService,
  resetWAAuthService,
} from "./WAAuthService";

export {
  WAMemberService,
  getWAMemberService,
  resetWAMemberService,
} from "./WAMemberService";

export {
  WASyncService,
  getWASyncService,
  resetWASyncService,
} from "./WASyncService";
export type { WASyncOptions } from "./WASyncService";
