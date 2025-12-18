-- CreateTable
CREATE TABLE "WaIdMapping" (
    "id" UUID NOT NULL,
    "entityType" TEXT NOT NULL,
    "waId" INTEGER NOT NULL,
    "clubosId" UUID NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaIdMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WaSyncState" (
    "id" UUID NOT NULL,
    "lastFullSync" TIMESTAMP(3),
    "lastIncSync" TIMESTAMP(3),
    "lastContactSync" TIMESTAMP(3),
    "lastEventSync" TIMESTAMP(3),
    "lastRegSync" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WaSyncState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WaIdMapping_entityType_clubosId_idx" ON "WaIdMapping"("entityType", "clubosId");

-- CreateIndex
CREATE INDEX "WaIdMapping_syncedAt_idx" ON "WaIdMapping"("syncedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WaIdMapping_entityType_waId_key" ON "WaIdMapping"("entityType", "waId");
