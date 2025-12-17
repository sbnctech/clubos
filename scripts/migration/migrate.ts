#!/usr/bin/env npx tsx
import { MigrationEngine } from './lib/migration-engine';
import { getDefaultConfigPath } from './lib/config';
import * as path from 'path';
import * as fs from 'fs';

const args = process.argv.slice(2);
let dryRun = true, dataDir = './scripts/migration/sample-pack', configPath = getDefaultConfigPath();
let membersFile: string | undefined, eventsFile: string | undefined, registrationsFile: string | undefined;
let outputDir = './scripts/migration/reports', verbose = true, confirmed = false;

for (let i = 0; i < args.length; i++) {
  const a = args[i], n = args[i + 1];
  if (a === '--help' || a === '-h') { console.log(`
ClubOS Migration - WA to ClubOS

Usage: npx tsx scripts/migration/migrate.ts [OPTIONS]

Options:
  --dry-run         Preview (default)
  --live            Write to DB (requires --yes)
  --yes             Confirm live mode
  --data-dir, -d    CSV directory
  --members         Members file
  --events          Events file
  --registrations   Registrations file
  --config, -c      Config path
  --output, -o      Report directory
  --quiet           Less output

Examples:
  npm run migrate:dry-run
  npm run migrate:live -- --yes --data-dir ./wa-export
`); process.exit(0); }
  if (a === '--dry-run') dryRun = true;
  if (a === '--live') dryRun = false;
  if (a === '--yes' || a === '-y') confirmed = true;
  if ((a === '--data-dir' || a === '-d') && n) { dataDir = n; i++; }
  if ((a === '--config' || a === '-c') && n) { configPath = n; i++; }
  if (a === '--members' && n) { membersFile = n; i++; }
  if (a === '--events' && n) { eventsFile = n; i++; }
  if (a === '--registrations' && n) { registrationsFile = n; i++; }
  if ((a === '--output' || a === '-o') && n) { outputDir = n; i++; }
  if (a === '--quiet' || a === '-q') verbose = false;
}

// Auto-detect
if (!membersFile && !eventsFile && !registrationsFile) {
  const dir = path.resolve(dataDir);
  if (fs.existsSync(dir)) {
    for (const sub of ['', 'members', 'events']) {
      const check = path.join(dir, sub);
      if (fs.existsSync(check) && fs.statSync(check).isDirectory()) {
        for (const f of fs.readdirSync(check)) {
          const l = f.toLowerCase();
          if (l.includes('member') && l.endsWith('.csv') && !membersFile) membersFile = path.join(sub, f);
          else if (l.includes('event') && !l.includes('registration') && l.endsWith('.csv') && !eventsFile) eventsFile = path.join(sub, f);
          else if (l.includes('registration') && l.endsWith('.csv') && !registrationsFile) registrationsFile = path.join(sub, f);
        }
      }
    }
  }
}

if (!membersFile && !eventsFile && !registrationsFile) { console.error('No CSV files found.'); process.exit(1); }
if (!dryRun && !confirmed) { console.log('\n⚠️ LIVE MODE requires --yes\n'); process.exit(1); }

new MigrationEngine({ dryRun, configPath, dataDir, membersFile, eventsFile, registrationsFile, outputDir, verbose })
  .run().then(r => process.exit(r.summary.errors > 0 ? 1 : 0)).catch(e => { console.error(e); process.exit(1); });
