/**
 * ClubOS Migration Engine
 * Core migration logic with dry-run support and idempotent imports
 */

import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import type {
  MigrationConfig,
  MigrationRunOptions,
  MigrationReport,
  MemberImport,
  EventImport,
  RegistrationImport,
  EntityReport,
  MemberLookup,
  EventLookup,
  MembershipStatusLookup,
  IdMapping,
} from './types';
import { loadConfig, getDefaultConfigPath } from './config';
import { loadCSVFile, mapMemberRecord, mapEventRecord, mapRegistrationRecord } from './csv-parser';
import * as path from 'path';
import * as fs from 'fs';

export class MigrationEngine {
  private prisma: PrismaClient;
  private config: MigrationConfig;
  private options: MigrationRunOptions;
  private report: MigrationReport;

  // Lookup caches
  private membershipStatuses: MembershipStatusLookup = {};
  private memberLookup: MemberLookup = { byEmail: new Map(), byWaId: new Map() };
  private eventLookup: EventLookup = { byTitleAndTime: new Map(), byWaId: new Map() };

  // ID mappings for reconciliation
  private memberIdMap: Map<string, string> = new Map(); // WA Contact ID -> ClubOS Member ID
  private eventIdMap: Map<string, string> = new Map();  // WA Event ID -> ClubOS Event ID

  constructor(options: MigrationRunOptions) {
    this.options = options;
    this.prisma = new PrismaClient();
    this.config = loadConfig(options.configPath || getDefaultConfigPath());
    this.report = this.initializeReport();
  }

  private initializeReport(): MigrationReport {
    return {
      runId: randomUUID(),
      startedAt: new Date(),
      dryRun: this.options.dryRun,
      config: {
        source: this.config.source,
        target: this.config.target,
        version: this.config.version,
      },
      summary: {
        totalRecords: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        duration_ms: 0,
      },
      members: this.initEntityReport(),
      events: this.initEntityReport(),
      registrations: this.initEntityReport(),
      errors: [],
      warnings: [],
      idMapping: { members: [], events: [] },
    };
  }

  private initEntityReport(): EntityReport {
    return {
      totalRows: 0,
      parsed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      records: [],
    };
  }

  async run(): Promise<MigrationReport> {
    const startTime = Date.now();
    this.log(`\n${'='.repeat(60)}`);
    this.log(`ClubOS Migration Pipeline - Run ID: ${this.report.runId}`);
    this.log(`Mode: ${this.options.dryRun ? 'DRY RUN (no database changes)' : 'LIVE IMPORT'}`);
    this.log(`${'='.repeat(60)}\n`);

    try {
      // Load lookup data from database
      await this.loadLookupData();

      // Process files in order: members first, then events, then registrations
      if (this.options.membersFile) {
        await this.processMembers();
      }

      if (this.options.eventsFile) {
        await this.processEvents();
      }

      if (this.options.registrationsFile) {
        await this.processRegistrations();
      }

      // Calculate totals
      this.report.summary.totalRecords =
        this.report.members.parsed +
        this.report.events.parsed +
        this.report.registrations.parsed;

      this.report.summary.created =
        this.report.members.created +
        this.report.events.created +
        this.report.registrations.created;

      this.report.summary.updated =
        this.report.members.updated +
        this.report.events.updated +
        this.report.registrations.updated;

      this.report.summary.skipped =
        this.report.members.skipped +
        this.report.events.skipped +
        this.report.registrations.skipped;

      this.report.summary.errors =
        this.report.members.errors +
        this.report.events.errors +
        this.report.registrations.errors;

    } catch (error) {
      this.log(`FATAL ERROR: ${(error as Error).message}`, 'error');
      this.report.errors.push({
        entity: 'member',
        sourceRow: 0,
        message: `Fatal error: ${(error as Error).message}`,
      });
    } finally {
      await this.prisma.$disconnect();
    }

    this.report.completedAt = new Date();
    this.report.summary.duration_ms = Date.now() - startTime;

    // Write report to file
    this.writeReport();

    // Print summary
    this.printSummary();

    return this.report;
  }

  // ============================================================================
  // Lookup Data Loading
  // ============================================================================

  private async loadLookupData(): Promise<void> {
    this.log('Loading lookup data from database...');

    // Load membership statuses
    const statuses = await this.prisma.membershipStatus.findMany();
    for (const status of statuses) {
      this.membershipStatuses[status.code] = status.id;
    }
    this.log(`  Loaded ${statuses.length} membership statuses`);

    // Load existing members for reconciliation
    const members = await this.prisma.member.findMany({
      select: { id: true, email: true },
    });
    for (const member of members) {
      this.memberLookup.byEmail.set(member.email.toLowerCase(), member.id);
    }
    this.log(`  Loaded ${members.length} existing members`);

    // Load existing events for reconciliation
    const events = await this.prisma.event.findMany({
      select: { id: true, title: true, startTime: true },
    });
    for (const event of events) {
      const key = this.makeEventKey(event.title, event.startTime);
      this.eventLookup.byTitleAndTime.set(key, event.id);
    }
    this.log(`  Loaded ${events.length} existing events`);

    this.log('');
  }

  private makeEventKey(title: string, startTime: Date): string {
    // Normalize: lowercase title, round time to nearest hour
    const normalizedTitle = title.toLowerCase().trim();
    const roundedTime = new Date(startTime);
    roundedTime.setMinutes(0, 0, 0);
    return `${normalizedTitle}|${roundedTime.toISOString()}`;
  }

  // ============================================================================
  // Member Processing
  // ============================================================================

  private async processMembers(): Promise<void> {
    const filePath = path.resolve(this.options.dataDir, this.options.membersFile!);
    this.log(`Processing members from: ${filePath}`);
    this.report.members.file = filePath;

    const rows = loadCSVFile(filePath);
    this.report.members.totalRows = rows.length;
    this.log(`  Found ${rows.length} rows`);

    const records: MemberImport[] = [];

    // Parse all records first
    for (let i = 0; i < rows.length; i++) {
      const record = mapMemberRecord(rows[i], i + 2, this.config); // +2 for 1-based + header
      records.push(record);
      this.report.members.parsed++;

      if (record._errors && record._errors.length > 0) {
        this.report.members.errors++;
        for (const error of record._errors) {
          this.report.errors.push({
            entity: 'member',
            sourceRow: record._sourceRow,
            message: error,
            waId: record._waId,
          });
        }
      }

      if (record._warnings && record._warnings.length > 0) {
        for (const warning of record._warnings) {
          this.report.warnings.push({
            entity: 'member',
            sourceRow: record._sourceRow,
            message: warning,
            waId: record._waId,
          });
        }
      }
    }

    // Process in batches
    const batchSize = this.config.import_options.batch_size;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.processMemberBatch(batch);
    }

    this.report.members.records = records;
    this.log(`  Completed: ${this.report.members.created} created, ${this.report.members.updated} updated, ${this.report.members.skipped} skipped, ${this.report.members.errors} errors\n`);
  }

  private async processMemberBatch(batch: MemberImport[]): Promise<void> {
    for (const record of batch) {
      if (record._errors && record._errors.length > 0) {
        record._action = 'skip';
        continue;
      }

      try {
        const email = record.email.toLowerCase();
        const existingId = this.memberLookup.byEmail.get(email);

        // Get membership status ID
        const statusId = this.membershipStatuses[record.membershipStatusCode];
        if (!statusId) {
          throw new Error(`Unknown membership status: ${record.membershipStatusCode}`);
        }

        if (existingId) {
          // Member exists - check reconciliation rule
          if (this.config.id_reconciliation.members.on_conflict === 'skip') {
            record._action = 'skip';
            record._clubosId = existingId;
            this.report.members.skipped++;
          } else {
            // Update existing member
            record._action = 'update';
            record._clubosId = existingId;

            if (!this.options.dryRun) {
              await this.prisma.member.update({
                where: { id: existingId },
                data: {
                  firstName: record.firstName,
                  lastName: record.lastName,
                  phone: record.phone || null,
                  joinedAt: record.joinedAt,
                  membershipStatusId: statusId,
                },
              });
            }

            this.report.members.updated++;
          }
        } else {
          // Create new member
          record._action = 'create';

          if (!this.options.dryRun) {
            const created = await this.prisma.member.create({
              data: {
                firstName: record.firstName,
                lastName: record.lastName,
                email: record.email,
                phone: record.phone || null,
                joinedAt: record.joinedAt,
                membershipStatusId: statusId,
              },
            });
            record._clubosId = created.id;
            this.memberLookup.byEmail.set(email, created.id);
          } else {
            record._clubosId = `dry-run-${randomUUID()}`;
          }

          this.report.members.created++;
        }

        // Track ID mapping
        if (record._waId && record._clubosId) {
          this.memberIdMap.set(record._waId, record._clubosId);
          this.report.idMapping.members.push({
            waId: record._waId,
            clubosId: record._clubosId,
            email: record.email,
          });
        }

      } catch (error) {
        record._action = 'skip';
        record._errors = record._errors || [];
        record._errors.push((error as Error).message);
        this.report.members.errors++;
        this.report.errors.push({
          entity: 'member',
          sourceRow: record._sourceRow,
          message: (error as Error).message,
          waId: record._waId,
        });

        if (!this.config.import_options.continue_on_error) {
          throw error;
        }
      }
    }
  }

  // ============================================================================
  // Event Processing
  // ============================================================================

  private async processEvents(): Promise<void> {
    const filePath = path.resolve(this.options.dataDir, this.options.eventsFile!);
    this.log(`Processing events from: ${filePath}`);
    this.report.events.file = filePath;

    const rows = loadCSVFile(filePath);
    this.report.events.totalRows = rows.length;
    this.log(`  Found ${rows.length} rows`);

    const records: EventImport[] = [];

    // Parse all records first
    for (let i = 0; i < rows.length; i++) {
      const record = mapEventRecord(rows[i], i + 2, this.config);
      records.push(record);
      this.report.events.parsed++;

      if (record._errors && record._errors.length > 0) {
        this.report.events.errors++;
        for (const error of record._errors) {
          this.report.errors.push({
            entity: 'event',
            sourceRow: record._sourceRow,
            message: error,
            waId: record._waId,
          });
        }
      }
    }

    // Process in batches
    const batchSize = this.config.import_options.batch_size;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.processEventBatch(batch);
    }

    this.report.events.records = records;
    this.log(`  Completed: ${this.report.events.created} created, ${this.report.events.updated} updated, ${this.report.events.skipped} skipped, ${this.report.events.errors} errors\n`);
  }

  private async processEventBatch(batch: EventImport[]): Promise<void> {
    for (const record of batch) {
      if (record._errors && record._errors.length > 0) {
        record._action = 'skip';
        continue;
      }

      try {
        const key = this.makeEventKey(record.title, record.startTime);
        const existingId = this.eventLookup.byTitleAndTime.get(key);

        if (existingId) {
          // Event exists - skip (events use skip by default)
          record._action = 'skip';
          record._clubosId = existingId;
          this.report.events.skipped++;
        } else {
          // Create new event
          record._action = 'create';

          if (!this.options.dryRun) {
            const created = await this.prisma.event.create({
              data: {
                title: record.title,
                description: record.description || null,
                category: record.category || null,
                location: record.location || null,
                startTime: record.startTime,
                endTime: record.endTime || null,
                capacity: record.capacity || null,
                isPublished: record.isPublished,
              },
            });
            record._clubosId = created.id;
            this.eventLookup.byTitleAndTime.set(key, created.id);
          } else {
            record._clubosId = `dry-run-${randomUUID()}`;
          }

          this.report.events.created++;
        }

        // Track ID mapping
        if (record._waId && record._clubosId) {
          this.eventIdMap.set(record._waId, record._clubosId);
          this.report.idMapping.events.push({
            waId: record._waId,
            clubosId: record._clubosId,
            title: record.title,
          });
        }

      } catch (error) {
        record._action = 'skip';
        record._errors = record._errors || [];
        record._errors.push((error as Error).message);
        this.report.events.errors++;
        this.report.errors.push({
          entity: 'event',
          sourceRow: record._sourceRow,
          message: (error as Error).message,
          waId: record._waId,
        });

        if (!this.config.import_options.continue_on_error) {
          throw error;
        }
      }
    }
  }

  // ============================================================================
  // Registration Processing
  // ============================================================================

  private async processRegistrations(): Promise<void> {
    const filePath = path.resolve(this.options.dataDir, this.options.registrationsFile!);
    this.log(`Processing registrations from: ${filePath}`);
    this.report.registrations.file = filePath;

    const rows = loadCSVFile(filePath);
    this.report.registrations.totalRows = rows.length;
    this.log(`  Found ${rows.length} rows`);

    const records: RegistrationImport[] = [];

    // Parse all records first
    for (let i = 0; i < rows.length; i++) {
      const record = mapRegistrationRecord(rows[i], i + 2, this.config);

      // Resolve member and event IDs
      const waContactId = record.memberId;
      const waEventId = record.eventId;

      record.memberId = this.memberIdMap.get(waContactId) || '';
      record.eventId = this.eventIdMap.get(waEventId) || '';

      if (!record.memberId) {
        record._errors = record._errors || [];
        record._errors.push(`Could not resolve member ID for WA Contact ID: ${waContactId}`);
      }
      if (!record.eventId) {
        record._errors = record._errors || [];
        record._errors.push(`Could not resolve event ID for WA Event ID: ${waEventId}`);
      }

      records.push(record);
      this.report.registrations.parsed++;

      if (record._errors && record._errors.length > 0) {
        this.report.registrations.errors++;
        for (const error of record._errors) {
          this.report.errors.push({
            entity: 'registration',
            sourceRow: record._sourceRow,
            message: error,
            waId: record._waId,
          });
        }
      }
    }

    // Process in batches
    const batchSize = this.config.import_options.batch_size;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await this.processRegistrationBatch(batch);
    }

    this.report.registrations.records = records;
    this.log(`  Completed: ${this.report.registrations.created} created, ${this.report.registrations.updated} updated, ${this.report.registrations.skipped} skipped, ${this.report.registrations.errors} errors\n`);
  }

  private async processRegistrationBatch(batch: RegistrationImport[]): Promise<void> {
    for (const record of batch) {
      if (record._errors && record._errors.length > 0) {
        record._action = 'skip';
        continue;
      }

      try {
        // Check for existing registration (unique constraint: eventId + memberId)
        const existing = this.options.dryRun
          ? null
          : await this.prisma.eventRegistration.findUnique({
              where: {
                eventId_memberId: {
                  eventId: record.eventId,
                  memberId: record.memberId,
                },
              },
            });

        // Map status
        const status = record.status as 'CONFIRMED' | 'CANCELLED' | 'WAITLISTED' | 'PENDING' | 'NO_SHOW';

        if (existing) {
          if (this.config.id_reconciliation.registrations.on_conflict === 'skip') {
            record._action = 'skip';
            record._clubosId = existing.id;
            this.report.registrations.skipped++;
          } else {
            // Update existing
            record._action = 'update';
            record._clubosId = existing.id;

            if (!this.options.dryRun) {
              await this.prisma.eventRegistration.update({
                where: { id: existing.id },
                data: {
                  status,
                  registeredAt: record.registeredAt,
                  cancelledAt: record.cancelledAt || null,
                },
              });
            }

            this.report.registrations.updated++;
          }
        } else {
          // Create new registration
          record._action = 'create';

          if (!this.options.dryRun) {
            const created = await this.prisma.eventRegistration.create({
              data: {
                eventId: record.eventId,
                memberId: record.memberId,
                status,
                registeredAt: record.registeredAt,
                cancelledAt: record.cancelledAt || null,
              },
            });
            record._clubosId = created.id;
          } else {
            record._clubosId = `dry-run-${randomUUID()}`;
          }

          this.report.registrations.created++;
        }

      } catch (error) {
        record._action = 'skip';
        record._errors = record._errors || [];
        record._errors.push((error as Error).message);
        this.report.registrations.errors++;
        this.report.errors.push({
          entity: 'registration',
          sourceRow: record._sourceRow,
          message: (error as Error).message,
          waId: record._waId,
        });

        if (!this.config.import_options.continue_on_error) {
          throw error;
        }
      }
    }
  }

  // ============================================================================
  // Reporting
  // ============================================================================

  private log(message: string, level: 'info' | 'error' | 'warn' = 'info'): void {
    if (this.options.verbose || level === 'error') {
      const prefix = level === 'error' ? '[ERROR] ' : level === 'warn' ? '[WARN] ' : '';
      console.log(`${prefix}${message}`);
    }
  }

  private writeReport(): void {
    const outputDir = path.resolve(this.options.outputDir);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const mode = this.options.dryRun ? 'dry-run' : 'live';
    const reportPath = path.join(outputDir, `migration-report-${mode}-${timestamp}.json`);

    // Create a summary report without all records (for readability)
    const summaryReport = {
      ...this.report,
      members: { ...this.report.members, records: `[${this.report.members.records.length} records]` },
      events: { ...this.report.events, records: `[${this.report.events.records.length} records]` },
      registrations: { ...this.report.registrations, records: `[${this.report.registrations.records.length} records]` },
    };

    fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));
    this.log(`Report written to: ${reportPath}`);

    // Also write full report with all records
    const fullReportPath = path.join(outputDir, `migration-report-${mode}-${timestamp}-full.json`);
    fs.writeFileSync(fullReportPath, JSON.stringify(this.report, null, 2));
    this.log(`Full report written to: ${fullReportPath}`);
  }

  private printSummary(): void {
    console.log(`\n${'='.repeat(60)}`);
    console.log('MIGRATION SUMMARY');
    console.log(`${'='.repeat(60)}`);
    console.log(`Run ID:     ${this.report.runId}`);
    console.log(`Mode:       ${this.options.dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
    console.log(`Duration:   ${this.report.summary.duration_ms}ms`);
    console.log('');
    console.log('Results:');
    console.log(`  Total Records: ${this.report.summary.totalRecords}`);
    console.log(`  Created:       ${this.report.summary.created}`);
    console.log(`  Updated:       ${this.report.summary.updated}`);
    console.log(`  Skipped:       ${this.report.summary.skipped}`);
    console.log(`  Errors:        ${this.report.summary.errors}`);
    console.log('');
    console.log('By Entity:');
    console.log(`  Members:       ${this.report.members.created} created, ${this.report.members.updated} updated, ${this.report.members.skipped} skipped`);
    console.log(`  Events:        ${this.report.events.created} created, ${this.report.events.updated} updated, ${this.report.events.skipped} skipped`);
    console.log(`  Registrations: ${this.report.registrations.created} created, ${this.report.registrations.updated} updated, ${this.report.registrations.skipped} skipped`);

    if (this.report.errors.length > 0) {
      console.log('');
      console.log(`Errors (${this.report.errors.length}):`);
      for (const error of this.report.errors.slice(0, 10)) {
        console.log(`  Row ${error.sourceRow}: ${error.message}`);
      }
      if (this.report.errors.length > 10) {
        console.log(`  ... and ${this.report.errors.length - 10} more errors`);
      }
    }

    console.log(`${'='.repeat(60)}\n`);
  }
}
