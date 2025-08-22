/*
  Warnings:

  - A unique constraint covering the columns `[exam_id]` on the table `InterviewRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "InterviewRequest_exam_id_key" ON "public"."InterviewRequest"("exam_id");
