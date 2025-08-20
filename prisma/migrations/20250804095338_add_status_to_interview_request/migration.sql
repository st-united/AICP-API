-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('PENDING', 'ASSIGNED');

-- AlterTable
ALTER TABLE "InterviewRequest" ADD COLUMN     "status" "InterviewRequestStatus" NOT NULL DEFAULT 'PENDING';
