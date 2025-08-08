/*
  Warnings:

  - You are about to drop the column `user_id` on the `InterviewRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InterviewRequest" DROP CONSTRAINT "InterviewRequest_user_id_fkey";

-- AlterTable
ALTER TABLE "InterviewRequest" DROP COLUMN "user_id";
