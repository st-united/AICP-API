-- CreateEnum
CREATE TYPE "UserTrackingStatus" AS ENUM ('REGISTERED', 'ACTIVATED', 'PROFILE_PENDING', 'PROFILE_COMPLETED');

-- CreateEnum
CREATE TYPE "TestTrackingStatus" AS ENUM ('TEST_STARTED', 'IN_PROGRESS', 'SUBMITTED', 'INTERVIEW_SCHEDULED', 'INTERVIEW_COMPLETED', 'RESULT_EVALUATED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExamStatus" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "ExamStatus" ADD VALUE 'INTERVIEW_COMPLETED';
ALTER TYPE "ExamStatus" ADD VALUE 'RESULT_EVALUATED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "statusTracking" "UserTrackingStatus" NOT NULL DEFAULT 'REGISTERED';
