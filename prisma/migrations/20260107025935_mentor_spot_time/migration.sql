/*
  Warnings:

  - You are about to drop the column `created_at` on the `InterviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `interview_date` on the `InterviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `mentor_time_spot_id` on the `InterviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `time_slot` on the `InterviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `InterviewRequest` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_id` on the `MentorTimeSpot` table. All the data in the column will be lost.
  - You are about to drop the column `metricDate` on the `OrganizationalMetrics` table. All the data in the column will be lost.
  - You are about to drop the `MentorSchedule` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[current_spot_id]` on the table `InterviewRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mentor_id,start_at]` on the table `MentorTimeSpot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `InterviewRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `MentorTimeSpot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metric_date` to the `OrganizationalMetrics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."InterviewRequestStatus" ADD VALUE 'RESCHEDULED';
ALTER TYPE "public"."InterviewRequestStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "public"."InterviewRequestStatus" ADD VALUE 'COMPLETED';

-- DropForeignKey
ALTER TABLE "public"."InterviewRequest" DROP CONSTRAINT "InterviewRequest_mentor_time_spot_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MentorSchedule" DROP CONSTRAINT "MentorSchedule_mentor_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."MentorTimeSpot" DROP CONSTRAINT "MentorTimeSpot_schedule_id_fkey";

-- DropIndex
DROP INDEX "public"."InterviewRequest_mentor_time_spot_id_key";

-- DropIndex
DROP INDEX "public"."MentorTimeSpot_schedule_id_idx";

-- AlterTable
ALTER TABLE "public"."InterviewRequest" DROP COLUMN "created_at",
DROP COLUMN "interview_date",
DROP COLUMN "mentor_time_spot_id",
DROP COLUMN "time_slot",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "current_spot_id" UUID,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "public"."MentorTimeSpot" DROP COLUMN "schedule_id",
ADD COLUMN     "calendar_event_id" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "meet_url" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- AlterTable
ALTER TABLE "public"."OrganizationalMetrics" DROP COLUMN "metricDate",
ADD COLUMN     "metric_date" TIMESTAMPTZ(6) NOT NULL;

-- DropTable
DROP TABLE "public"."MentorSchedule";

-- DropEnum
DROP TYPE "public"."TimeSlotBooking";

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRequest_current_spot_id_key" ON "public"."InterviewRequest"("current_spot_id");

-- CreateIndex
CREATE UNIQUE INDEX "MentorTimeSpot_mentor_id_start_at_key" ON "public"."MentorTimeSpot"("mentor_id", "start_at");

-- AddForeignKey
ALTER TABLE "public"."InterviewRequest" ADD CONSTRAINT "InterviewRequest_current_spot_id_fkey" FOREIGN KEY ("current_spot_id") REFERENCES "public"."MentorTimeSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
