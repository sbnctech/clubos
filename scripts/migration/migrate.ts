#!/usr/bin/env npx ts-node
/**
 * ClubOS Migration CLI
 * Wild Apricot -> ClubOS Data Migration Tool
 *
 * Usage:
 *   npx ts-node scripts/migration/migrate.ts --dry-run --data-dir ./migration-pack
 *   npx ts-node scripts/migration/migrate.ts --live --data-dir ./migration-pack
 */

import { MigrationEngine } from './lib/migration-engine';
import { getDefaultConfigPath } from './lib/config';
import * as path from 'path';

interface CLIArgs {
  dryRun: boolean;
  configPath: string;
  dataDir: string;
  membersFile?: string;
  eventsFile?: string;
  registrationsFile?: string;
  outputDir: string;
  verbose: boolean;
  help: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {
    dryRun: true, // Default to dry-run for safety
    configPath: getDefaultConfigPath(),
    dataDir: './scripts/migration/sample-pack',
    membersFile: undefined,
    eventsFile: undefined,
    registrationsFile: undefined,
    outputDir: './scripts/migration/reports',
    verbose: true,
    help: false,
  };

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case '--help':
      case '-h':
        args.help = true;
        break;

      case '--dry-run':
        args.dryRun = true;
        break;

      case '--live':
        args.dryRun = false;
        break;

      case '--config':
      case '-c':
        args.configPath = nextArg;
        i++;
        break;

      case '--data-dir':
      case '-d':
        args.dataDir = nextArg;
        i++;
        break;

      case '--members':
        args.membersFile = nextArg;
        i++;
        break;

      case '--events':
        args.eventsFile = nextArg;
        i++;
        break;

      case '--registrations':
        args.registrationsFile = nextArg;
        i++;
        break;

      case '--output':
      case '-o':
        args.outputDir = nextArg;
        i++;
        break;

      case '--verbose':
      case '-v':
        args.verbose = true;
        break;

      case '--quiet':
      case '-q':
        args.verbose = false;
        break;
    }
  }

  // Auto-detect files in data directory if not specified
  if (!args.membersFile && !args.eventsFile && !args.registrationsFile) {
    const fs = require('fs');
    const dataDir = path.resolve(args.dataDir);

    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);

      for (const file of files) {
        const lower = file.toLowerCase();
        if (lower.includes('member') && lower.endsWith('.csv')) {
          args.membersFile = file;
        } else if (lower.includes('event') && !lower.includes('registration') && lower.endsWith('.csv')) {
          args.eventsFile = file;
        } else if (lower.includes('registration') && lower.endsWith('.csv')) {
          args.registrationsFile = file;
        }
      }
    }
  }

  return args;
}

function printUsage(): void {
  console.log(`
ClubOS Migration Tool - Wild Apricot to ClubOS Data Migration

USAGE:
  npx ts-node scripts/migration/migrate.ts [OPTIONS]

OPTIONS:
  --dry-run           Run without making database changes (default)
  --live              Actually write to the database

  --data-dir, -d      Directory containing CSV files (default: ./scripts/migration/sample-pack)
  --members           Members CSV file name (auto-detected if not specified)
  --events            Events CSV file name (auto-detected if not specified)
  --registrations     Registrations CSV file name (auto-detected if not specified)

  --config, -c        Path to migration config YAML (default: built-in config)
  --output, -o        Directory for reports (default: ./scripts/migration/reports)

  --verbose, -v       Show detailed output (default)
  --quiet, -q         Show minimal output

  --help, -h          Show this help message

EXAMPLES:
  # Dry run with sample data
  npx ts-node scripts/migration/migrate.ts --dry-run

  # Dry run with real data
  npx ts-node scripts/migration/migrate.ts --dry-run --data-dir ./wa-export

  # Live import (writes to database)
  npx ts-node scripts/migration/migrate.ts --live --data-dir ./wa-export

  # Import only members
  npx ts-node scripts/migration/migrate.ts --live --data-dir ./wa-export --members members.csv

FILE NAMING:
  The tool auto-detects CSV files based on naming:
  - Files containing "member" -> members import
  - Files containing "event" (not "registration") -> events import
  - Files containing "registration" -> registrations import

SAFETY:
  - Always run with --dry-run first to preview changes
  - Imports are idempotent (safe to re-run)
  - Members matched by email, events by title+time
  - Reports are generated for every run

REQUIRED WA EXPORTS:
  1. Contacts export (All contacts -> Export -> Excel/CSV)
     Required columns: Contact ID, First name, Last name, Email, Phone, Member since, Membership level

  2. Events export (Events -> Export all)
     Required columns: Event ID, Event name, Start date, End date, Location, Registration limit

  3. Registrations export (per event or bulk)
     Required columns: Registration ID, Contact ID, Event ID, Registration status, Registration date
`);
}

async function main(): Promise<void> {
  const args = parseArgs();

  if (args.help) {
    printUsage();
    process.exit(0);
  }

  // Verify at least one file type to process
  if (!args.membersFile && !args.eventsFile && !args.registrationsFile) {
    console.error('ERROR: No CSV files found in data directory.');
    console.error(`Looked in: ${path.resolve(args.dataDir)}`);
    console.error('');
    console.error('Make sure your data directory contains CSV files with "member", "event", or "registration" in the name.');
    console.error('Or specify files explicitly with --members, --events, --registrations');
    console.error('');
    console.error('Run with --help for more information.');
    process.exit(1);
  }

  // Safety check for live mode
  if (!args.dryRun) {
    console.log('\n⚠️  WARNING: LIVE MODE - This will modify the database!');
    console.log('');
    console.log('Files to import:');
    if (args.membersFile) console.log(`  Members: ${args.membersFile}`);
    if (args.eventsFile) console.log(`  Events: ${args.eventsFile}`);
    if (args.registrationsFile) console.log(`  Registrations: ${args.registrationsFile}`);
    console.log('');

    // Check for confirmation flag or prompt
    if (!process.argv.includes('--yes') && !process.argv.includes('-y')) {
      console.log('Add --yes or -y to confirm, or use --dry-run first.');
      console.log('');
      process.exit(1);
    }
  }

  const engine = new MigrationEngine({
    dryRun: args.dryRun,
    configPath: args.configPath,
    dataDir: args.dataDir,
    membersFile: args.membersFile,
    eventsFile: args.eventsFile,
    registrationsFile: args.registrationsFile,
    outputDir: args.outputDir,
    verbose: args.verbose,
  });

  try {
    const report = await engine.run();

    // Exit with error code if there were errors
    if (report.summary.errors > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', (error as Error).message);
    process.exit(1);
  }
}

main();
