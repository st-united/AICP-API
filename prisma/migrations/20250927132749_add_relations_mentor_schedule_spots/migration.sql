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
CREATE TABLE "public"."MentorSchedule" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "timezone" VARCHAR NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MentorTimeSpot" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_id" UUID NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "status" "public"."MentorSpotStatus" NOT NULL,
    "timezone" TEXT NOT NULL,
    "schedule_id" UUID,

    CONSTRAINT "MentorTimeSpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MentorSchedule_mentor_id_is_active_idx" ON "public"."MentorSchedule"("mentor_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "mentorId_name" ON "public"."MentorSchedule"("mentor_id", "name");

-- CreateIndex
CREATE INDEX "MentorTimeSpot_mentor_id_start_at_idx" ON "public"."MentorTimeSpot"("mentor_id", "start_at");

-- CreateIndex
CREATE INDEX "MentorTimeSpot_schedule_id_idx" ON "public"."MentorTimeSpot"("schedule_id");

-- CreateIndex
CREATE INDEX "MentorTimeSpot_status_start_at_idx" ON "public"."MentorTimeSpot"("status", "start_at");

-- CreateIndex
CREATE INDEX "Exam_user_id_idx" ON "public"."Exam"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewRequest_mentor_time_spot_id_key" ON "public"."InterviewRequest"("mentor_time_spot_id");

-- AddForeignKey
ALTER TABLE "public"."MentorSchedule" ADD CONSTRAINT "MentorSchedule_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."Mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentorTimeSpot" ADD CONSTRAINT "MentorTimeSpot_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "public"."Mentor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentorTimeSpot" ADD CONSTRAINT "MentorTimeSpot_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "public"."MentorSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InterviewRequest" ADD CONSTRAINT "InterviewRequest_mentor_time_spot_id_fkey" FOREIGN KEY ("mentor_time_spot_id") REFERENCES "public"."MentorTimeSpot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
