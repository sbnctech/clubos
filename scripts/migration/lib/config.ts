/**
 * ClubOS Migration Configuration Loader
 * Loads and validates YAML migration configuration
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import type { MigrationConfig } from './types';

const REQUIRED_SECTIONS = [
  'version',
  'membership_status_mapping',
  'member_fields',
  'event_fields',
  'registration_fields',
  'id_reconciliation',
  'import_options',
] as const;

export function loadConfig(configPath: string): MigrationConfig {
  const absolutePath = path.resolve(configPath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Configuration file not found: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf-8');
  const config = yaml.parse(content) as MigrationConfig;

  validateConfig(config, absolutePath);

  return config;
}

function validateConfig(config: MigrationConfig, filePath: string): void {
  const errors: string[] = [];

  for (const section of REQUIRED_SECTIONS) {
    if (!(section in config)) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Validate membership status mapping has required codes
  const requiredStatuses = ['NEWCOMER', 'EXTENDED', 'ALUMNI', 'LAPSED', 'PROSPECT'];
  const mappedStatuses = new Set(Object.values(config.membership_status_mapping || {}));
  for (const status of requiredStatuses) {
    if (!mappedStatuses.has(status)) {
      errors.push(`Membership status mapping missing target: ${status}`);
    }
  }

  // Validate member fields has required mappings
  const requiredMemberFields = ['firstName', 'lastName', 'email', 'joinedAt', 'membershipStatusId'];
  for (const field of requiredMemberFields) {
    if (!(field in (config.member_fields || {}))) {
      errors.push(`Member fields missing required mapping: ${field}`);
    }
  }

  // Validate event fields has required mappings
  const requiredEventFields = ['title', 'startTime'];
  for (const field of requiredEventFields) {
    if (!(field in (config.event_fields || {}))) {
      errors.push(`Event fields missing required mapping: ${field}`);
    }
  }

  // Validate id_reconciliation rules
  if (config.id_reconciliation) {
    if (!config.id_reconciliation.members?.primary_key && !config.id_reconciliation.members?.composite_key) {
      errors.push('id_reconciliation.members must have primary_key or composite_key');
    }
    if (!config.id_reconciliation.events?.composite_key) {
      errors.push('id_reconciliation.events must have composite_key');
    }
  }

  // Validate import_options
  if (config.import_options) {
    if (!config.import_options.batch_size || config.import_options.batch_size < 1) {
      errors.push('import_options.batch_size must be a positive integer');
    }
    if (!config.import_options.source_timezone) {
      errors.push('import_options.source_timezone is required');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid migration configuration (${filePath}):\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

export function getDefaultConfigPath(): string {
  return path.join(__dirname, '..', 'config', 'migration-config.yaml');
}
