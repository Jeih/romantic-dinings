-- CreateTable
CREATE TABLE "ItineraryShare" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "placeIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ItineraryShare_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ItineraryShare_code_key" ON "ItineraryShare"("code");
