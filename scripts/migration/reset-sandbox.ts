#!/usr/bin/env npx ts-node
/**
 * ClubOS Migration Reset Tool
 * Safely resets sandbox data for migration testing
 *
 * ⚠️  DANGER: This tool deletes data. Use with extreme caution.
 *
 * Usage:
 *   npx ts-node scripts/migration/reset-sandbox.ts --dry-run
 *   npx ts-node scripts/migration/reset-sandbox.ts --confirm "I understand this deletes data"
 */

import { PrismaClient } from '@prisma/client';

interface ResetOptions {
  dryRun: boolean;
  confirmed: boolean;
  preserveStatuses: boolean;
  preserveCommittees: boolean;
  preserveTerms: boolean;
}

function parseArgs(): ResetOptions {
  const args: ResetOptions = {
    dryRun: true,
    confirmed: false,
    preserveStatuses: true,
    preserveCommittees: true,
    preserveTerms: true,
  };

  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case '--dry-run':
        args.dryRun = true;
        break;

      case '--confirm':
        if (nextArg === 'I understand this deletes data') {
          args.confirmed = true;
          args.dryRun = false;
        }
        i++;
        break;

      case '--reset-all':
        args.preserveStatuses = false;
        args.preserveCommittees = false;
        args.preserveTerms = false;
        break;

      case '--reset-statuses':
        args.preserveStatuses = false;
        break;

      case '--reset-committees':
        args.preserveCommittees = false;
        break;

      case '--reset-terms':
        args.preserveTerms = false;
        break;

      case '--help':
      case '-h':
        printUsage();
        process.exit(0);
    }
  }

  return args;
}

function printUsage(): void {
  console.log(`
ClubOS Migration Reset Tool

⚠️  WARNING: This tool DELETES DATA from the database!

USAGE:
  npx ts-node scripts/migration/reset-sandbox.ts [OPTIONS]

OPTIONS:
  --dry-run               Show what would be deleted without actually deleting (default)
  --confirm "I understand this deletes data"
                          Actually perform the reset (required for real deletion)

  --reset-all             Also reset membership statuses, committees, and terms
  --reset-statuses        Also reset membership statuses
  --reset-committees      Also reset committees and roles
  --reset-terms           Also reset terms

  --help, -h              Show this help message

WHAT GETS DELETED:
  By default (with confirmation):
  - All event registrations
  - All payment intents
  - All events
  - All members
  - All user accounts
  - All role assignments
  - All service history
  - All transition plans

  Preserved by default:
  - Membership statuses (NEWCOMER, EXTENDED, etc.)
  - Committees and roles
  - Terms

EXAMPLES:
  # Preview what would be deleted
  npx ts-node scripts/migration/reset-sandbox.ts --dry-run

  # Actually reset (after confirming dry-run output)
  npx ts-node scripts/migration/reset-sandbox.ts --confirm "I understand this deletes data"

  # Full reset including reference data
  npx ts-node scripts/migration/reset-sandbox.ts --confirm "I understand this deletes data" --reset-all

SAFETY:
  - This tool will NOT run against production databases
  - Always run --dry-run first
  - The confirmation phrase is intentionally long to prevent accidents
`);
}

async function main(): Promise<void> {
  const options = parseArgs();
  const prisma = new PrismaClient();

  console.log('\n' + '='.repeat(60));
  console.log('ClubOS Migration Reset Tool');
  console.log('='.repeat(60));

  // Safety check: refuse to run on production
  const databaseUrl = process.env.DATABASE_URL || '';
  if (databaseUrl.includes('prod') || databaseUrl.includes('production')) {
    console.error('\n❌ ABORT: This appears to be a production database!');
    console.error('   Reset tool will not run against production.');
    process.exit(1);
  }

  if (options.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No data will be deleted\n');
  } else if (!options.confirmed) {
    console.error('\n❌ ABORT: Confirmation required for actual deletion.');
    console.error('   Use: --confirm "I understand this deletes data"');
    process.exit(1);
  } else {
    console.log('\n⚠️  LIVE MODE - Data WILL be deleted!\n');
  }

  try {
    // Count records before deletion
    const counts = {
      paymentIntents: await prisma.paymentIntent.count(),
      registrations: await prisma.eventRegistration.count(),
      events: await prisma.event.count(),
      roleAssignments: await prisma.roleAssignment.count(),
      serviceHistory: await prisma.memberServiceHistory.count(),
      transitionAssignments: await prisma.transitionAssignment.count(),
      transitionPlans: await prisma.transitionPlan.count(),
      userAccounts: await prisma.userAccount.count(),
      members: await prisma.member.count(),
      membershipStatuses: await prisma.membershipStatus.count(),
      committeeRoles: await prisma.committeeRole.count(),
      committees: await prisma.committee.count(),
      terms: await prisma.term.count(),
    };

    console.log('Current record counts:');
    console.log(`  Payment Intents:       ${counts.paymentIntents}`);
    console.log(`  Event Registrations:   ${counts.registrations}`);
    console.log(`  Events:                ${counts.events}`);
    console.log(`  Role Assignments:      ${counts.roleAssignments}`);
    console.log(`  Service History:       ${counts.serviceHistory}`);
    console.log(`  Transition Assignments:${counts.transitionAssignments}`);
    console.log(`  Transition Plans:      ${counts.transitionPlans}`);
    console.log(`  User Accounts:         ${counts.userAccounts}`);
    console.log(`  Members:               ${counts.members}`);
    console.log(`  Membership Statuses:   ${counts.membershipStatuses} ${options.preserveStatuses ? '(preserved)' : '(will delete)'}`);
    console.log(`  Committee Roles:       ${counts.committeeRoles} ${options.preserveCommittees ? '(preserved)' : '(will delete)'}`);
    console.log(`  Committees:            ${counts.committees} ${options.preserveCommittees ? '(preserved)' : '(will delete)'}`);
    console.log(`  Terms:                 ${counts.terms} ${options.preserveTerms ? '(preserved)' : '(will delete)'}`);
    console.log('');

    if (options.dryRun) {
      console.log('To actually delete, run with:');
      console.log('  --confirm "I understand this deletes data"');
      console.log('');
      await prisma.$disconnect();
      return;
    }

    // Perform deletion in correct order (respecting foreign keys)
    console.log('Deleting records...');

    // 1. Payment intents (depends on registrations)
    const deletedPayments = await prisma.paymentIntent.deleteMany();
    console.log(`  Deleted ${deletedPayments.count} payment intents`);

    // 2. Event registrations (depends on events and members)
    const deletedRegs = await prisma.eventRegistration.deleteMany();
    console.log(`  Deleted ${deletedRegs.count} event registrations`);

    // 3. Transition assignments (depends on transition plans, members, committees)
    const deletedTransAssign = await prisma.transitionAssignment.deleteMany();
    console.log(`  Deleted ${deletedTransAssign.count} transition assignments`);

    // 4. Service history (depends on members, committees, events, terms, transition plans)
    const deletedHistory = await prisma.memberServiceHistory.deleteMany();
    console.log(`  Deleted ${deletedHistory.count} service history records`);

    // 5. Transition plans (depends on terms, members)
    const deletedTrans = await prisma.transitionPlan.deleteMany();
    console.log(`  Deleted ${deletedTrans.count} transition plans`);

    // 6. Role assignments (depends on members, committees, roles, terms)
    const deletedRoles = await prisma.roleAssignment.deleteMany();
    console.log(`  Deleted ${deletedRoles.count} role assignments`);

    // 7. Events (independent after registrations deleted)
    const deletedEvents = await prisma.event.deleteMany();
    console.log(`  Deleted ${deletedEvents.count} events`);

    // 8. User accounts (depends on members)
    const deletedUsers = await prisma.userAccount.deleteMany();
    console.log(`  Deleted ${deletedUsers.count} user accounts`);

    // 9. Members (depends on membership statuses)
    const deletedMembers = await prisma.member.deleteMany();
    console.log(`  Deleted ${deletedMembers.count} members`);

    // Optional: Reference data
    if (!options.preserveTerms) {
      const deletedTerms = await prisma.term.deleteMany();
      console.log(`  Deleted ${deletedTerms.count} terms`);
    }

    if (!options.preserveCommittees) {
      const deletedCommRoles = await prisma.committeeRole.deleteMany();
      console.log(`  Deleted ${deletedCommRoles.count} committee roles`);

      const deletedComms = await prisma.committee.deleteMany();
      console.log(`  Deleted ${deletedComms.count} committees`);
    }

    if (!options.preserveStatuses) {
      const deletedStatuses = await prisma.membershipStatus.deleteMany();
      console.log(`  Deleted ${deletedStatuses.count} membership statuses`);
    }

    console.log('\n✅ Reset complete!\n');

  } catch (error) {
    console.error('\n❌ Reset failed:', (error as Error).message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
