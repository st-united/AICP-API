/*
  Warnings:

  - A unique constraint covering the columns `[exam_id]` on the table `MentorBooking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `meeting_link` to the `MentorBooking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MentorBooking" ADD COLUMN     "exam_id" UUID,
ADD COLUMN     "meeting_link" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "MentorBooking_exam_id_key" ON "MentorBooking"("exam_id");

-- AddForeignKey
ALTER TABLE "MentorBooking" ADD CONSTRAINT "MentorBooking_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
