/*
  Warnings:

  - The values [PENDING,ACCEPTED,REJECTED,CANCELLED] on the enum `MentorBookingStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MentorBookingStatus_new" AS ENUM ('UPCOMING', 'COMPLETED', 'NOT_JOINED');
ALTER TABLE "MentorBooking" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MentorBooking" ALTER COLUMN "status" TYPE "MentorBookingStatus_new" USING ("status"::text::"MentorBookingStatus_new");
ALTER TYPE "MentorBookingStatus" RENAME TO "MentorBookingStatus_old";
ALTER TYPE "MentorBookingStatus_new" RENAME TO "MentorBookingStatus";
DROP TYPE "MentorBookingStatus_old";
ALTER TABLE "MentorBooking" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
COMMIT;

-- AlterTable
ALTER TABLE "MentorBooking" ALTER COLUMN "status" SET DEFAULT 'UPCOMING';
