#!/usr/bin/env node
/**
 * ClubOS Intake Schema Validator
 * Copyright (c) Santa Barbara Newcomers Club. All rights reserved.
 *
 * Validates client intake JSON against INTAKE_SCHEMA.json
 * No external dependencies required.
 *
 * Usage:
 *   node scripts/solutions/validate_intake_schema.mjs path/to/intake.json
 *   node scripts/solutions/validate_intake_schema.mjs path/to/intake.json --schema path/to/schema.json
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_SCHEMA_PATH = resolve(__dirname, '../../docs/solutions/INTAKE_SCHEMA.json');

// Exit codes (exported for testing)
export const EXIT_PASS = 0;
export const EXIT_FAIL = 1;
export const EXIT_WARN = 2;

// Red-flag definitions
const RED_FLAGS = [
  { id: 'RF-001', severity: 'CRITICAL', path: 'contacts.systemOwner', message: 'No systemOwner contact defined' },
  { id: 'RF-002', severity: 'HIGH', path: 'contacts.dataOwner', message: 'No dataOwner contact defined' },
  { id: 'RF-003', severity: 'CRITICAL', path: 'dataSources.memberExport', message: 'memberExport not defined' },
  { id: 'RF-004', severity: 'MEDIUM', path: 'policies.membershipLevels', message: 'No membershipLevels defined', isArray: true },
  { id: 'RF-005', severity: 'HIGH', path: 'successCriteria.goLiveDefinition', message: 'goLiveDefinition is empty or too short', minLength: 10 },
  { id: 'RF-006', severity: 'MEDIUM', path: 'successCriteria.mustHave', message: 'No mustHave success criteria defined', isArray: true },
  { id: 'RF-007', severity: 'MEDIUM', path: 'currentSystems.membershipPlatform', message: 'currentSystems.membershipPlatform missing' },
  { id: 'RF-008', severity: 'LOW', path: 'risks.identifiedRisks', message: 'identifiedRisks array is empty', isArray: true },
];

// Required field paths (from schema)
const REQUIRED_PATHS = [
  'org',
  'org.name',
  'org.timezone',
  'contacts',
  'contacts.systemOwner',
  'contacts.systemOwner.name',
  'contacts.systemOwner.email',
  'dataSources',
  'dataSources.memberExport',
  'successCriteria',
  'successCriteria.goLiveDefinition',
];

function getNestedValue(obj, path) {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = current[part];
  }
  return current;
}

function loadJson(filePath) {
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`ERROR: File not found: ${filePath}`);
    } else if (err instanceof SyntaxError) {
      console.error(`ERROR: Invalid JSON in ${filePath}: ${err.message}`);
    } else {
      console.error(`ERROR: Could not read ${filePath}: ${err.message}`);
    }
    process.exit(EXIT_FAIL);
  }
}

function checkRequiredFields(intake) {
  const missing = [];
  for (const path of REQUIRED_PATHS) {
    const value = getNestedValue(intake, path);
    if (value === undefined || value === null || value === '') {
      missing.push(path);
    }
  }
  return missing;
}

function checkRedFlags(intake) {
  const flags = [];
  for (const flag of RED_FLAGS) {
    const value = getNestedValue(intake, flag.path);
    let triggered = false;

    if (value === undefined || value === null) {
      triggered = true;
    } else if (flag.isArray && (!Array.isArray(value) || value.length === 0)) {
      triggered = true;
    } else if (flag.minLength && typeof value === 'string' && value.length < flag.minLength) {
      triggered = true;
    }

    if (triggered) {
      flags.push(flag);
    }
  }
  return flags;
}

/**
 * Formats a validation report from the validation results.
 * Exported for testing.
 *
 * @param {string} filePath - Path to the validated file
 * @param {string[]} missingFields - Array of missing required field paths
 * @param {Array<{id: string, severity: string, message: string}>} redFlags - Triggered red flags
 * @param {string} [timestamp] - Optional timestamp override for testing
 * @returns {{report: string, exitCode: number}}
 */
export function formatReport(filePath, missingFields, redFlags, timestamp = new Date().toISOString()) {
  const lines = [
    'INTAKE VALIDATION REPORT',
    '========================',
    `File: ${filePath}`,
    `Date: ${timestamp}`,
    '',
  ];

  // Required fields check
  if (missingFields.length === 0) {
    lines.push('REQUIRED FIELDS: PASS');
  } else {
    lines.push('REQUIRED FIELDS: FAIL');
    for (const field of missingFields) {
      lines.push(`  - ${field}: missing`);
    }
  }
  lines.push('');

  // Red-flag scan
  if (redFlags.length === 0) {
    lines.push('RED-FLAG SCAN: CLEAR');
  } else {
    lines.push('RED-FLAG SCAN: FLAGS DETECTED');
    for (const flag of redFlags) {
      lines.push(`  - ${flag.id} [${flag.severity}]: ${flag.message}`);
    }
  }
  lines.push('');

  // Overall result
  const hasCriticalFlags = redFlags.some(f => f.severity === 'CRITICAL');
  let result;
  let exitCode;

  if (missingFields.length > 0) {
    result = 'FAIL';
    exitCode = EXIT_FAIL;
  } else if (hasCriticalFlags) {
    result = 'WARN';
    exitCode = EXIT_WARN;
  } else {
    result = 'PASS';
    exitCode = EXIT_PASS;
  }

  lines.push(`RESULT: ${result}`);

  return { report: lines.join('\n'), exitCode };
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
ClubOS Intake Schema Validator

Usage:
  node scripts/solutions/validate_intake_schema.mjs <intake.json> [options]

Options:
  --schema <path>  Path to schema file (default: docs/solutions/INTAKE_SCHEMA.json)
  --help, -h       Show this help message

Exit codes:
  0  PASS - All validations succeeded
  1  FAIL - Required field validation failed
  2  WARN - Passed but critical red flags detected
`);
    process.exit(args.length === 0 ? EXIT_FAIL : EXIT_PASS);
  }

  // Parse arguments
  let intakePath = null;
  let schemaPath = DEFAULT_SCHEMA_PATH;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--schema' && args[i + 1]) {
      schemaPath = resolve(args[i + 1]);
      i++;
    } else if (!args[i].startsWith('-')) {
      intakePath = resolve(args[i]);
    }
  }

  if (!intakePath) {
    console.error('ERROR: No intake file specified');
    process.exit(EXIT_FAIL);
  }

  // Load files (schema loaded for future full validation)
  loadJson(schemaPath); // Verify schema exists
  const intake = loadJson(intakePath);

  // Run validations
  const missingFields = checkRequiredFields(intake);
  const redFlags = checkRedFlags(intake);

  // Generate and print report
  const { report, exitCode } = formatReport(intakePath, missingFields, redFlags);
  console.log(report);

  process.exit(exitCode);
}

// Only run main() when executed directly (not when imported for testing)
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
