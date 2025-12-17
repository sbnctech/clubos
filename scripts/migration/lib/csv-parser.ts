/**
 * ClubOS Migration CSV Parser
 * Parses CSV exports from Wild Apricot with field mapping
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  MigrationConfig,
  MigrationRecord,
  MemberImport,
  EventImport,
  RegistrationImport,
  FieldTransform,
} from './types';

// Simple CSV parser that handles quoted fields with commas and newlines
export function parseCSV(content: string): Array<Record<string, string>> {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if ((char === '\n' || (char === '\r' && nextChar === '\n')) && !inQuotes) {
      // End of line
      if (current.trim()) {
        lines.push(current);
      }
      current = '';
      if (char === '\r') i++; // Skip \n in \r\n
    } else if (char !== '\r') {
      current += char;
    }
  }
  if (current.trim()) {
    lines.push(current);
  }

  if (lines.length === 0) {
    return [];
  }

  const headers = parseCSVLine(lines[0]);
  const records: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const record: Record<string, string> = {};

    for (let j = 0; j < headers.length; j++) {
      record[headers[j]] = values[j] || '';
    }

    records.push(record);
  }

  return records;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());

  return values;
}

export function loadCSVFile(filePath: string): Array<Record<string, string>> {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CSV file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  return parseCSV(content);
}

// ============================================================================
// Field Mappers
// ============================================================================

export function mapMemberRecord(
  row: Record<string, string>,
  rowIndex: number,
  config: MigrationConfig
): MemberImport {
  const record: MemberImport = {
    _sourceRow: rowIndex,
    firstName: '',
    lastName: '',
    email: '',
    joinedAt: new Date(),
    membershipStatusCode: 'PROSPECT',
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [targetField, sourceSpec] of Object.entries(config.member_fields)) {
    if (targetField.startsWith('_')) {
      // WA-specific field for tracking
      const sourceField = typeof sourceSpec === 'string' ? sourceSpec : (sourceSpec as FieldTransform).source;
      if (targetField === '_wa_contact_id' || targetField === '_wa_member_id') {
        record._waId = row[sourceField] || undefined;
      }
      continue;
    }

    try {
      const value = extractFieldValue(row, sourceSpec, config, 'member');

      if (targetField === 'joinedAt') {
        const dateValue = parseDate(value as string, config.import_options);
        if (dateValue) {
          record.joinedAt = dateValue;
        } else if (value) {
          warnings.push(`Could not parse joinedAt date: ${value}`);
          record.joinedAt = new Date(); // Default to now
        }
      } else if (targetField === 'membershipStatusId') {
        // This gets converted to membershipStatusCode for lookup
        record.membershipStatusCode = value as string;
      } else {
        (record as Record<string, unknown>)[targetField] = value;
      }
    } catch (error) {
      errors.push(`Field ${targetField}: ${(error as Error).message}`);
    }
  }

  // Validate required fields
  if (!record.email) {
    errors.push('Missing required field: email');
  }
  if (!record.firstName) {
    errors.push('Missing required field: firstName');
  }
  if (!record.lastName) {
    errors.push('Missing required field: lastName');
  }

  record._errors = errors.length > 0 ? errors : undefined;
  record._warnings = warnings.length > 0 ? warnings : undefined;

  return record;
}

export function mapEventRecord(
  row: Record<string, string>,
  rowIndex: number,
  config: MigrationConfig
): EventImport {
  const record: EventImport = {
    _sourceRow: rowIndex,
    title: '',
    startTime: new Date(),
    isPublished: true,
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [targetField, sourceSpec] of Object.entries(config.event_fields)) {
    if (targetField.startsWith('_')) {
      const sourceField = typeof sourceSpec === 'string' ? sourceSpec : (sourceSpec as FieldTransform).source;
      if (targetField === '_wa_event_id') {
        record._waId = row[sourceField] || undefined;
      }
      continue;
    }

    try {
      const value = extractFieldValue(row, sourceSpec, config, 'event');

      if (targetField === 'startTime' || targetField === 'endTime') {
        const dateValue = parseDate(value as string, config.import_options);
        if (dateValue) {
          (record as Record<string, unknown>)[targetField] = dateValue;
        } else if (value && targetField === 'startTime') {
          errors.push(`Could not parse startTime: ${value}`);
        }
      } else if (targetField === 'capacity') {
        const numValue = parseInt(value as string, 10);
        if (!isNaN(numValue) && numValue > 0) {
          record.capacity = numValue;
        }
      } else if (targetField === 'category') {
        // Apply category mapping
        const rawCategory = value as string;
        record.category = config.event_category_mapping[rawCategory]
          || config.event_category_mapping._default
          || rawCategory;
      } else if (typeof value === 'boolean') {
        (record as Record<string, unknown>)[targetField] = value;
      } else {
        (record as Record<string, unknown>)[targetField] = value;
      }
    } catch (error) {
      errors.push(`Field ${targetField}: ${(error as Error).message}`);
    }
  }

  // Validate required fields
  if (!record.title) {
    errors.push('Missing required field: title');
  }
  if (!record.startTime || isNaN(record.startTime.getTime())) {
    errors.push('Missing or invalid required field: startTime');
  }

  record._errors = errors.length > 0 ? errors : undefined;
  record._warnings = warnings.length > 0 ? warnings : undefined;

  return record;
}

export function mapRegistrationRecord(
  row: Record<string, string>,
  rowIndex: number,
  config: MigrationConfig
): RegistrationImport {
  const record: RegistrationImport = {
    _sourceRow: rowIndex,
    memberId: '',
    eventId: '',
    status: 'CONFIRMED',
    registeredAt: new Date(),
  };

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const [targetField, sourceSpec] of Object.entries(config.registration_fields)) {
    if (targetField.startsWith('_')) {
      const sourceField = typeof sourceSpec === 'string' ? sourceSpec : (sourceSpec as FieldTransform).source;
      if (targetField === '_wa_registration_id') {
        record._waId = row[sourceField] || undefined;
      }
      continue;
    }

    try {
      const value = extractFieldValue(row, sourceSpec, config, 'registration');

      if (targetField === 'registeredAt' || targetField === 'cancelledAt') {
        const dateValue = parseDate(value as string, config.import_options);
        if (dateValue) {
          (record as Record<string, unknown>)[targetField] = dateValue;
        }
      } else if (targetField === 'status') {
        record.status = value as string;
      } else {
        (record as Record<string, unknown>)[targetField] = value;
      }
    } catch (error) {
      errors.push(`Field ${targetField}: ${(error as Error).message}`);
    }
  }

  record._errors = errors.length > 0 ? errors : undefined;
  record._warnings = warnings.length > 0 ? warnings : undefined;

  return record;
}

// ============================================================================
// Helper Functions
// ============================================================================

function extractFieldValue(
  row: Record<string, string>,
  sourceSpec: string | boolean | FieldTransform,
  config: MigrationConfig,
  entityType: 'member' | 'event' | 'registration'
): string | boolean {
  // Static value
  if (typeof sourceSpec === 'boolean') {
    return sourceSpec;
  }

  // Simple field mapping
  if (typeof sourceSpec === 'string') {
    return row[sourceSpec] || '';
  }

  // Transform mapping
  const transform = sourceSpec as FieldTransform;
  const rawValue = row[transform.source] || '';

  switch (transform.transform) {
    case 'membership_status_lookup':
      return config.membership_status_mapping[rawValue]
        || config.membership_status_mapping._default
        || 'PROSPECT';

    case 'registration_status_lookup':
      return config.registration_status_mapping[rawValue]
        || config.registration_status_mapping._default
        || 'CONFIRMED';

    case 'member_id_lookup':
    case 'event_id_lookup':
      // These are resolved later during the import phase
      return rawValue;

    default:
      throw new Error(`Unknown transform: ${transform.transform}`);
  }
}

function parseDate(
  value: string,
  options: { date_format: string; datetime_format: string; source_timezone: string }
): Date | null {
  if (!value || value.trim() === '') {
    return null;
  }

  // Try parsing various formats
  const cleanValue = value.trim();

  // ISO format
  if (cleanValue.includes('T') || cleanValue.match(/^\d{4}-\d{2}-\d{2}/)) {
    const date = new Date(cleanValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // MM/DD/YYYY or MM/DD/YYYY HH:mm format
  const mdyMatch = cleanValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?/);
  if (mdyMatch) {
    const [, month, day, year, hour, minute] = mdyMatch;
    const date = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1,
      parseInt(day, 10),
      hour ? parseInt(hour, 10) : 0,
      minute ? parseInt(minute, 10) : 0
    );
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // YYYY-MM-DD format
  const ymdMatch = cleanValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const date = new Date(cleanValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
}
