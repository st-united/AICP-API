/*
  Warnings:

  - Made the column `exam_set_id` on table `Exam` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `domain_id` to the `ExamSet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExamStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'WAITING_FOR_REVIEW', 'GRADED');

-- CreateEnum
CREATE TYPE "SFIALevel" AS ENUM ('FOUNDATION_L1_L2', 'INTERMEDIATE_L3_L4', 'ADVANCED_L5_L6', 'EXPERT_L7');

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "exam_status" "ExamStatus",
ADD COLUMN     "level_of_domain" "SFIALevel",
ALTER COLUMN "exam_set_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "ExamSet" ADD COLUMN     "domain_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "ExamSet" ADD CONSTRAINT "ExamSet_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
