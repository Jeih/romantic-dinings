-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('restaurant', 'bar', 'cafe', 'activity', 'attraction');

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "place_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PlaceType" NOT NULL,
    "vibes" TEXT[],
    "price_level" INTEGER,
    "address" JSONB NOT NULL,
    "cuisine" TEXT[],
    "photo_url" TEXT,
    "photo_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_place_id_key" ON "Place"("place_id");
