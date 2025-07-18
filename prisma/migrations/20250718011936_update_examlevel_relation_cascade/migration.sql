-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_exam_level_id_fkey";

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_exam_level_id_fkey" FOREIGN KEY ("exam_level_id") REFERENCES "ExamLevel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
