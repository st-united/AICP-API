/*
  Warnings:

  - Added the required column `exam_set_id` to the `UserAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserAnswerStatus" AS ENUM ('DRAFT', 'SUBMIT');

-- AlterTable
ALTER TABLE "UserAnswer" ADD COLUMN     "answer_id" UUID,
ADD COLUMN     "exam_set_id" UUID NOT NULL,
ADD COLUMN     "status" "UserAnswerStatus" NOT NULL DEFAULT 'DRAFT';

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_exam_set_id_fkey" FOREIGN KEY ("exam_set_id") REFERENCES "ExamSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "AnswerOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;
