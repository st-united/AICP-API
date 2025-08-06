/*
  Warnings:

  - Added the required column `exam_id` to the `MentorBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MentorBooking" ADD COLUMN     "exam_id" UUID;

-- AddForeignKey
ALTER TABLE "MentorBooking" ADD CONSTRAINT "MentorBooking_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
