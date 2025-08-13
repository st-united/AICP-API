/*
  Warnings:

  - Made the column `interview_request_id` on table `MentorBooking` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."MentorBooking" ADD COLUMN     "meeting_url" TEXT,
ALTER COLUMN "interview_request_id" SET NOT NULL;
