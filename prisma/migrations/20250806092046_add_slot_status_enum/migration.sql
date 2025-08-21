-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'ALMOST_FULL', 'FULL');

-- AlterTable
ALTER TABLE "MentorBooking" ALTER COLUMN "interview_request_id" DROP NOT NULL;
