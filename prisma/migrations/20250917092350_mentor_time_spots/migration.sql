/*
  Warnings:

  - A unique constraint covering the columns `[mentor_time_spot_id]` on the table `InterviewRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."MentorSpotStatus" AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."InterviewRequest" ADD COLUMN     "mentor_time_spot_id" UUID,
ALTER COLUMN "time_slot" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."MentorTimeSpot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentorId" UUID NOT NULL,
    "startAt" TIMESTAMPTZ(6) NOT NULL,
    "endAt" TIMESTAMPTZ(6) NOT NULL,
    "duration_minutes" SMALLINT NOT NULL,
    "status" "public"."MentorSpotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "timezone" VARCHAR NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "MentorTimeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorTimeSpot_mentorId_status_startAt_idx" ON "public"."MentorTimeSpot"("mentorId", "status", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "MentorTimeSpot_mentorId_startAt_key" ON "public"."MentorTimeSpot"("mentorId", "startAt");

-- CreateIndex
CREATE INDEX "Exam_user_id_idx" ON "public"."Exam"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRequest_mentor_time_spot_id_key" ON "public"."InterviewRequest"("mentor_time_spot_id");

-- AddForeignKey
ALTER TABLE "public"."MentorTimeSpot" ADD CONSTRAINT "MentorTimeSpot_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "public"."Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewRequest" ADD CONSTRAINT "InterviewRequest_mentor_time_spot_id_fkey" FOREIGN KEY ("mentor_time_spot_id") REFERENCES "public"."MentorTimeSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
