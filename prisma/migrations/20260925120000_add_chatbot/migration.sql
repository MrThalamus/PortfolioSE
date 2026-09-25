-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "chatbotNotes" TEXT;

-- CreateTable
CREATE TABLE "ChatRateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatRateLimit_pkey" PRIMARY KEY ("key")
);

