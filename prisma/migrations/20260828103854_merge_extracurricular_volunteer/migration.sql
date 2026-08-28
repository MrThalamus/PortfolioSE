-- DropTable
DROP TABLE "ExtracurricularEntry";

-- DropTable
DROP TABLE "VolunteerEntry";

-- CreateTable
CREATE TABLE "BeyondAcademicsEntry" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "role" TEXT,
    "year" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeyondAcademicsEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BeyondAcademicsEntry_order_idx" ON "BeyondAcademicsEntry"("order");
