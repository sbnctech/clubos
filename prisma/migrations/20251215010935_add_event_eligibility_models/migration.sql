-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventChairId" UUID;

-- CreateTable
CREATE TABLE "CommitteeMembership" (
    "id" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "committeeId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "role" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommitteeMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSponsorship" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "committeeId" UUID NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "capacity" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "constraints" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketEligibilityOverride" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "ticketTypeId" UUID NOT NULL,
    "memberId" UUID NOT NULL,
    "allow" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketEligibilityOverride_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CommitteeMembership_memberId_idx" ON "CommitteeMembership"("memberId");

-- CreateIndex
CREATE INDEX "CommitteeMembership_committeeId_idx" ON "CommitteeMembership"("committeeId");

-- CreateIndex
CREATE INDEX "CommitteeMembership_startDate_endDate_idx" ON "CommitteeMembership"("startDate", "endDate");

-- CreateIndex
CREATE UNIQUE INDEX "CommitteeMembership_memberId_committeeId_startDate_key" ON "CommitteeMembership"("memberId", "committeeId", "startDate");

-- CreateIndex
CREATE INDEX "EventSponsorship_eventId_idx" ON "EventSponsorship"("eventId");

-- CreateIndex
CREATE INDEX "EventSponsorship_committeeId_idx" ON "EventSponsorship"("committeeId");

-- CreateIndex
CREATE UNIQUE INDEX "EventSponsorship_eventId_committeeId_key" ON "EventSponsorship"("eventId", "committeeId");

-- CreateIndex
CREATE INDEX "TicketType_eventId_idx" ON "TicketType"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketType_eventId_code_key" ON "TicketType"("eventId", "code");

-- CreateIndex
CREATE INDEX "TicketEligibilityOverride_eventId_idx" ON "TicketEligibilityOverride"("eventId");

-- CreateIndex
CREATE INDEX "TicketEligibilityOverride_ticketTypeId_idx" ON "TicketEligibilityOverride"("ticketTypeId");

-- CreateIndex
CREATE INDEX "TicketEligibilityOverride_memberId_idx" ON "TicketEligibilityOverride"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "TicketEligibilityOverride_eventId_ticketTypeId_memberId_key" ON "TicketEligibilityOverride"("eventId", "ticketTypeId", "memberId");

-- CreateIndex
CREATE INDEX "Event_eventChairId_idx" ON "Event"("eventChairId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventChairId_fkey" FOREIGN KEY ("eventChairId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommitteeMembership" ADD CONSTRAINT "CommitteeMembership_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsorship" ADD CONSTRAINT "EventSponsorship_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSponsorship" ADD CONSTRAINT "EventSponsorship_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEligibilityOverride" ADD CONSTRAINT "TicketEligibilityOverride_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEligibilityOverride" ADD CONSTRAINT "TicketEligibilityOverride_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketEligibilityOverride" ADD CONSTRAINT "TicketEligibilityOverride_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
