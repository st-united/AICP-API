/*
  Warnings:

  - Made the column `interview_date` on table `InterviewRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "InterviewRequest" ALTER COLUMN "interview_date" SET NOT NULL;
