/**
 * Wild Apricot Importer Module
 *
 * Main exports for the WA import system.
 */

// Client
export { WildApricotClient, createWAClient, createWAClientWithConfig } from "./client";

// Config
export {
  loadWAConfig,
  isDryRun,
  isProductionImportAllowed,
  validateProductionSafety,
  getSystemActor,
} from "./config";
export type { WAConfig } from "./config";

// Types
export type {
  WAContact,
  WAContactStatus,
  WAEvent,
  WAEventRegistration,
  WAMembershipLevel,
  SyncResult,
  SyncStats,
  SyncError,
} from "./types";

// Transformers
export {
  transformContact,
  transformEvent,
  transformRegistration,
  mapContactStatusToCode,
  mapRegistrationStatus,
  extractFieldValue,
  extractPhone,
  normalizeEmail,
  parseDate,
  deriveCategory,
} from "./transformers";

// Importer
export {
  fullSync,
  incrementalSync,
  runPreflightChecks,
  detectStaleRecords,
  getStaleRecordCounts,
  cleanupStaleMappings,
} from "./importer";
export type { PreflightResult, StaleRecord, StaleDetectionResult } from "./importer";
