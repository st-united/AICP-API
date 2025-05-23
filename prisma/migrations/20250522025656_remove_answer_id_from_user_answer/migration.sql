/*
  Warnings:

  - You are about to drop the column `answer_id` on the `UserAnswer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserAnswer" DROP CONSTRAINT "UserAnswer_answer_id_fkey";

-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "answer_id";
