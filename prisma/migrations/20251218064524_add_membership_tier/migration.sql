-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "membershipTierId" UUID,
ADD COLUMN     "waMembershipLevelRaw" TEXT;

-- CreateTable
CREATE TABLE "MembershipTier" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MembershipTier_code_key" ON "MembershipTier"("code");

-- CreateIndex
CREATE INDEX "MembershipTier_sortOrder_idx" ON "MembershipTier"("sortOrder");

-- CreateIndex
CREATE INDEX "Member_membershipTierId_idx" ON "Member"("membershipTierId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_membershipTierId_fkey" FOREIGN KEY ("membershipTierId") REFERENCES "MembershipTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
