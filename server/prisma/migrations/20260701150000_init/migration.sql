CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETE');
CREATE TYPE "RequestStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'BLOCKED', 'DONE');
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "RequestType" AS ENUM ('BUG', 'FEATURE', 'QUESTION', 'CHANGE_REQUEST');

CREATE TABLE "Client" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "contactEmail" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Project" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "clientId" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Request" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" "RequestStatus" NOT NULL DEFAULT 'NEW',
  "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
  "requestType" "RequestType" NOT NULL,
  "createdBy" TEXT NOT NULL,
  "assignedTo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "requestId" UUID NOT NULL,
  "authorName" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isInternal" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditEvent" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "actor" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");
CREATE INDEX "Request_projectId_idx" ON "Request"("projectId");
CREATE INDEX "Request_status_idx" ON "Request"("status");
CREATE INDEX "Request_priority_idx" ON "Request"("priority");
CREATE INDEX "Request_updatedAt_idx" ON "Request"("updatedAt");
CREATE INDEX "Comment_requestId_idx" ON "Comment"("requestId");
CREATE INDEX "AuditEvent_actor_idx" ON "AuditEvent"("actor");
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "Client"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Request"
  ADD CONSTRAINT "Request_projectId_fkey"
  FOREIGN KEY ("projectId") REFERENCES "Project"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Comment"
  ADD CONSTRAINT "Comment_requestId_fkey"
  FOREIGN KEY ("requestId") REFERENCES "Request"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
