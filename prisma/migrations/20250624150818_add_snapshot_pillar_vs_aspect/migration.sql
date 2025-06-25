/*
  Warnings:

  - You are about to drop the column `mindset_score` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `skillset_score` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `toolset_score` on the `Exam` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "mindset_score",
DROP COLUMN "skillset_score",
DROP COLUMN "toolset_score";

-- CreateTable
CREATE TABLE "ExamPillarSnapshot" (
    "exam_id" UUID NOT NULL,
    "pillar_id" UUID NOT NULL,
    "mindset_score" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExamPillarSnapshot_pkey" PRIMARY KEY ("exam_id","pillar_id")
);

-- CreateTable
CREATE TABLE "ExamAspectSnapshot" (
    "exam_id" UUID NOT NULL,
    "aspect_id" UUID NOT NULL,
    "mindset_score" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExamAspectSnapshot_pkey" PRIMARY KEY ("exam_id","aspect_id")
);

-- AddForeignKey
ALTER TABLE "ExamPillarSnapshot" ADD CONSTRAINT "ExamPillarSnapshot_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamPillarSnapshot" ADD CONSTRAINT "ExamPillarSnapshot_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAspectSnapshot" ADD CONSTRAINT "ExamAspectSnapshot_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAspectSnapshot" ADD CONSTRAINT "ExamAspectSnapshot_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
