/*
  Warnings:

  - Added the required column `latitude` to the `Place` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Place` table without a default value. This is not possible if the table is not empty.

*/
-- First rename the existing JSON column to avoid conflicts
ALTER TABLE "Place" 
  RENAME COLUMN "address" TO "address_json";

-- Add the new columns
ALTER TABLE "Place" 
  ADD COLUMN "address" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION;

-- Update the new columns with data from the JSON column
UPDATE "Place"
SET 
  "address" = CAST("address_json"->>'formatted_address' AS TEXT),
  "latitude" = CAST("address_json"->'geometry'->'location'->>'lat' AS DOUBLE PRECISION),
  "longitude" = CAST("address_json"->'geometry'->'location'->>'lng' AS DOUBLE PRECISION);

-- Make the new columns NOT NULL
ALTER TABLE "Place" 
  ALTER COLUMN "address" SET NOT NULL,
  ALTER COLUMN "latitude" SET NOT NULL,
  ALTER COLUMN "longitude" SET NOT NULL;

-- Drop the old JSON column
ALTER TABLE "Place" DROP COLUMN "address_json";