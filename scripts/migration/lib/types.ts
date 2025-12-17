/**
 * ClubOS Migration Pipeline Types
 * Type definitions for WA -> ClubOS data migration
 */

// ============================================================================
// Configuration Types
// ============================================================================

export interface MigrationConfig {
  version: string;
  source: string;
  target: string;
  membership_status_mapping: Record<string, string>;
  member_fields: Record<string, string | FieldTransform>;
  event_fields: Record<string, string | boolean | FieldTransform>;
  event_category_mapping: Record<string, string>;
  registration_fields: Record<string, string | FieldTransform>;
  registration_status_mapping: Record<string, string>;
  committee_mapping: Record<string, string>;
  id_reconciliation: IdReconciliationConfig;
  import_options: ImportOptions;
}

export interface FieldTransform {
  source: string;
  transform: string;
}

export interface IdReconciliationConfig {
  members: ReconciliationRule;
  events: ReconciliationRule;
  registrations: ReconciliationRule;
}

export interface ReconciliationRule {
  primary_key?: string;
  secondary_key?: string;
  composite_key?: string[];
  time_tolerance_minutes?: number;
  on_conflict: 'update' | 'skip' | 'error';
}

export interface ImportOptions {
  batch_size: number;
  continue_on_error: boolean;
  date_format: string;
  datetime_format: string;
  source_timezone: string;
  skip_incomplete: boolean;
  required_fields: {
    members: string[];
    events: string[];
    registrations: string[];
  };
}

// ============================================================================
// Migration Data Types
// ============================================================================

export interface MigrationRecord {
  _sourceRow: number;
  _waId?: string;
  _clubosId?: string;
  _action?: 'create' | 'update' | 'skip';
  _errors?: string[];
  _warnings?: string[];
  [key: string]: unknown;
}

export interface MemberImport extends MigrationRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  joinedAt: Date;
  membershipStatusCode: string;
}

export interface EventImport extends MigrationRecord {
  title: string;
  description?: string;
  category?: string;
  location?: string;
  startTime: Date;
  endTime?: Date;
  capacity?: number;
  isPublished: boolean;
}

export interface RegistrationImport extends MigrationRecord {
  memberId: string;
  eventId: string;
  status: string;
  registeredAt: Date;
  cancelledAt?: Date;
}

// ============================================================================
// Migration Report Types
// ============================================================================

export interface MigrationReport {
  runId: string;
  startedAt: Date;
  completedAt?: Date;
  dryRun: boolean;
  config: {
    source: string;
    target: string;
    version: string;
  };
  summary: MigrationSummary;
  members: EntityReport;
  events: EntityReport;
  registrations: EntityReport;
  errors: MigrationError[];
  warnings: MigrationWarning[];
  idMapping: IdMappingReport;
}

export interface MigrationSummary {
  totalRecords: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  duration_ms: number;
}

export interface EntityReport {
  file?: string;
  totalRows: number;
  parsed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  records: MigrationRecord[];
}

export interface MigrationError {
  entity: 'member' | 'event' | 'registration';
  sourceRow: number;
  field?: string;
  message: string;
  waId?: string;
}

export interface MigrationWarning {
  entity: 'member' | 'event' | 'registration';
  sourceRow: number;
  message: string;
  waId?: string;
}

export interface IdMappingReport {
  members: IdMapping[];
  events: IdMapping[];
}

export interface IdMapping {
  waId: string;
  clubosId: string;
  email?: string;
  title?: string;
}

// ============================================================================
// Migration Options
// ============================================================================

export interface MigrationRunOptions {
  dryRun: boolean;
  configPath: string;
  dataDir: string;
  membersFile?: string;
  eventsFile?: string;
  registrationsFile?: string;
  outputDir: string;
  verbose: boolean;
  resetFirst?: boolean;
}

// ============================================================================
// Database Lookup Types
// ============================================================================

export interface MembershipStatusLookup {
  [code: string]: string; // code -> id
}

export interface MemberLookup {
  byEmail: Map<string, string>; // email -> id
  byWaId: Map<string, string>;  // wa_contact_id -> id
}

export interface EventLookup {
  byTitleAndTime: Map<string, string>; // `${title}|${startTime}` -> id
  byWaId: Map<string, string>;         // wa_event_id -> id
}
