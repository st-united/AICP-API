/*
  Warnings:

  - You are about to drop the column `exam_id` on the `MentorBooking` table. All the data in the column will be lost.
  - You are about to drop the column `scheduled_at` on the `MentorBooking` table. All the data in the column will be lost.
  - You are about to drop the column `time_slot` on the `MentorBooking` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `MentorBooking` table. All the data in the column will be lost.
  - Added the required column `interview_request_id` to the `MentorBooking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MentorBooking" DROP CONSTRAINT "MentorBooking_exam_id_fkey";

-- DropForeignKey
ALTER TABLE "MentorBooking" DROP CONSTRAINT "MentorBooking_user_id_fkey";

-- AlterTable
ALTER TABLE "MentorBooking" DROP COLUMN "exam_id",
DROP COLUMN "scheduled_at",
DROP COLUMN "time_slot",
DROP COLUMN "user_id",
ADD COLUMN     "interview_request_id" UUID NOT NULL;

-- CreateTable
CREATE TABLE "InterviewRequest" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "exam_id" UUID NOT NULL,
    "interview_date" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "InterviewRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MentorBooking" ADD CONSTRAINT "MentorBooking_interview_request_id_fkey" FOREIGN KEY ("interview_request_id") REFERENCES "InterviewRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewRequest" ADD CONSTRAINT "InterviewRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewRequest" ADD CONSTRAINT "InterviewRequest_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
