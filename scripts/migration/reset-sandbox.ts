#!/usr/bin/env npx tsx
import { PrismaClient } from '@prisma/client';

const args = process.argv.slice(2);
let dryRun = true, confirmed = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--dry-run') dryRun = true;
  if (args[i] === '--confirm' && args[i + 1] === 'I understand this deletes data') { confirmed = true; dryRun = false; i++; }
  if (args[i] === '--help') { console.log(`
Reset Sandbox - ⚠️ Deletes data!

Usage: npx tsx scripts/migration/reset-sandbox.ts [OPTIONS]

Options:
  --dry-run                     Preview (default)
  --confirm "I understand..."   Actually delete

Deletes: registrations, events, members, user accounts, role assignments, service history
Preserves: membership statuses, committees, terms
`); process.exit(0); }
}

async function main() {
  const prisma = new PrismaClient();
  const dbUrl = process.env.DATABASE_URL || '';
  if (dbUrl.includes('prod')) { console.error('❌ Production database!'); process.exit(1); }
  console.log(`\n${'='.repeat(40)}\nReset Sandbox${dryRun ? ' (DRY RUN)' : ''}\n${'='.repeat(40)}`);
  if (!dryRun && !confirmed) { console.error('Use: --confirm "I understand this deletes data"'); process.exit(1); }
  try {
    const counts = { payments: await prisma.paymentIntent.count(), regs: await prisma.eventRegistration.count(), events: await prisma.event.count(), roles: await prisma.roleAssignment.count(), history: await prisma.memberServiceHistory.count(), users: await prisma.userAccount.count(), members: await prisma.member.count() };
    console.log('Counts:', counts);
    if (dryRun) { console.log('\nUse --confirm "I understand this deletes data" to delete'); return; }
    await prisma.paymentIntent.deleteMany();
    await prisma.eventRegistration.deleteMany();
    await prisma.transitionAssignment.deleteMany();
    await prisma.memberServiceHistory.deleteMany();
    await prisma.transitionPlan.deleteMany();
    await prisma.roleAssignment.deleteMany();
    await prisma.event.deleteMany();
    await prisma.userAccount.deleteMany();
    await prisma.member.deleteMany();
    console.log('✅ Done');
  } finally { await prisma.$disconnect(); }
}
main();
