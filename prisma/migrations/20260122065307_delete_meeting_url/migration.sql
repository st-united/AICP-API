/*
  Warnings:

  - You are about to drop the column `meeting_url` on the `MentorBooking` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Exam_user_id_idx";

-- AlterTable
ALTER TABLE "public"."InterviewRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."MentorBooking" DROP COLUMN "meeting_url";

-- AlterTable
ALTER TABLE "public"."MentorTimeSpot" ALTER COLUMN "updatedAt" DROP DEFAULT;
