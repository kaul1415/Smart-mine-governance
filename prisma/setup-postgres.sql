-- CoalGov PostgreSQL Database DDL Setup Script
-- Database: PostgreSQL 12+

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE "Role" AS ENUM ('ADMIN', 'MINE_OFFICIAL', 'INSPECTOR', 'MANAGER', 'REGULATOR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ComplianceCategory" AS ENUM ('SAFETY', 'ENVIRONMENT', 'PRODUCTION', 'LABOUR');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ComplianceStatus" AS ENUM ('COMPLIANT', 'NON_COMPLIANT', 'UNDER_REVIEW', 'EXPIRED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "InspectionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'FLAGGED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE "ViolationStatus" AS ENUM ('REPORTED', 'ACTION_ASSIGNED', 'RECTIFIED', 'VERIFIED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'MINE_OFFICIAL',
    "phone" VARCHAR(50),
    "mineName" VARCHAR(255),
    "designation" VARCHAR(255),
    "refreshToken" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Mines Table
CREATE TABLE IF NOT EXISTS "mines" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "code" VARCHAR(100) NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "subsidiary" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "operationalStatus" VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Statutory Compliances Table
CREATE TABLE IF NOT EXISTS "statutory_compliances" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "mineId" VARCHAR(36) NOT NULL REFERENCES "mines"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "category" "ComplianceCategory" NOT NULL,
    "status" "ComplianceStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "validUntil" TIMESTAMP(3),
    "documentUrl" TEXT,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Inspections Table
CREATE TABLE IF NOT EXISTS "inspections" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "mineId" VARCHAR(36) NOT NULL REFERENCES "mines"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "inspectorId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "status" "InspectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "completedDate" TIMESTAMP(3),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "reportUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Violations Table
CREATE TABLE IF NOT EXISTS "violations" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "inspectionId" VARCHAR(36) NOT NULL REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "reporterId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "Severity" NOT NULL DEFAULT 'MEDIUM',
    "status" "ViolationStatus" NOT NULL DEFAULT 'REPORTED',
    "category" "ComplianceCategory" NOT NULL,
    "deadline" TIMESTAMP(3),
    "noticePdfUrl" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Corrective Actions Table
CREATE TABLE IF NOT EXISTS "corrective_actions" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "violationId" VARCHAR(36) NOT NULL REFERENCES "violations"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    "assigneeId" VARCHAR(36) NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    "actionPlan" TEXT NOT NULL,
    "responseText" TEXT,
    "responsePdfUrl" TEXT,
    "evidenceUrl" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Logs Table (Cryptographic Blockchain Ledger)
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" VARCHAR(36) NOT NULL PRIMARY KEY,
    "blockIndex" SERIAL UNIQUE,
    "userId" VARCHAR(36) REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "action" VARCHAR(255) NOT NULL,
    "entity" VARCHAR(255) NOT NULL,
    "entityId" VARCHAR(255),
    "metadata" JSONB,
    "previousHash" VARCHAR(64) NOT NULL,
    "hash" VARCHAR(64) NOT NULL,
    "nonce" INTEGER NOT NULL DEFAULT 0,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimal querying
CREATE INDEX IF NOT EXISTS "idx_mines_subsidiary" ON "mines"("subsidiary");
CREATE INDEX IF NOT EXISTS "idx_compliances_mineId" ON "statutory_compliances"("mineId");
CREATE INDEX IF NOT EXISTS "idx_inspections_mineId" ON "inspections"("mineId");
CREATE INDEX IF NOT EXISTS "idx_violations_inspectionId" ON "violations"("inspectionId");
CREATE INDEX IF NOT EXISTS "idx_corrective_actions_violationId" ON "corrective_actions"("violationId");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_blockIndex" ON "audit_logs"("blockIndex");
CREATE INDEX IF NOT EXISTS "idx_audit_logs_hash" ON "audit_logs"("hash");
