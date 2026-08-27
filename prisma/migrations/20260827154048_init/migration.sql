-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('VIDEO', 'LIVE', 'REPO');

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "techStack" TEXT[],
    "type" "ProjectType" NOT NULL DEFAULT 'REPO',
    "videoUrl" TEXT,
    "liveUrl" TEXT,
    "repoUrl" TEXT,
    "thumbnailUrl" TEXT,
    "problem" TEXT,
    "approach" TEXT,
    "outcome" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExtracurricularEntry" (
    "id" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExtracurricularEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerEntry" (
    "id" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "contribution" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "altText" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL DEFAULT 'profile',
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "heroIntro" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "resumeUrl" TEXT,
    "skills" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "Project_order_idx" ON "Project"("order");

-- CreateIndex
CREATE INDEX "Achievement_order_idx" ON "Achievement"("order");

-- CreateIndex
CREATE INDEX "ExtracurricularEntry_order_idx" ON "ExtracurricularEntry"("order");

-- CreateIndex
CREATE INDEX "VolunteerEntry_order_idx" ON "VolunteerEntry"("order");

-- CreateIndex
CREATE INDEX "Photo_order_idx" ON "Photo"("order");
