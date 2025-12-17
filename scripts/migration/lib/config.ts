import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import type { MigrationConfig } from './types';

export function loadConfig(configPath: string): MigrationConfig {
  const absolutePath = path.resolve(configPath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Config not found: ${absolutePath}`);
  const config = yaml.parse(fs.readFileSync(absolutePath, 'utf-8')) as MigrationConfig;
  const required = ['version', 'membership_status_mapping', 'member_fields', 'event_fields', 'registration_fields', 'id_reconciliation', 'import_options'];
  for (const s of required) if (!(s in config)) throw new Error(`Missing section: ${s}`);
  return config;
}

export function getDefaultConfigPath(): string {
  return path.join(__dirname, '..', 'config', 'migration-config.yaml');
}
