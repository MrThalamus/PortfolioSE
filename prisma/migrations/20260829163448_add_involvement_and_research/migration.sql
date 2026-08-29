-- CreateEnum
CREATE TYPE "InvolvementType" AS ENUM ('JOB', 'CLUB', 'RESEARCH_LAB', 'VOLUNTEER', 'OTHER');

-- CreateEnum
CREATE TYPE "ResearchStatus" AS ENUM ('ONGOING', 'SUBMITTED', 'PUBLISHED');

-- CreateTable
CREATE TABLE "Involvement" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "type" "InvolvementType" NOT NULL DEFAULT 'OTHER',
    "period" TEXT NOT NULL,
    "current" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "link" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Involvement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "venue" TEXT,
    "role" TEXT,
    "year" INTEGER NOT NULL,
    "status" "ResearchStatus" NOT NULL DEFAULT 'ONGOING',
    "description" TEXT,
    "link" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResearchItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Involvement_order_idx" ON "Involvement"("order");

-- CreateIndex
CREATE INDEX "ResearchItem_order_idx" ON "ResearchItem"("order");
