/*
  Warnings:

  - You are about to drop the column `assessment_type` on the `CompetencyAssessment` table. All the data in the column will be lost.
  - You are about to drop the column `assessment_type` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `assessment_type` on the `ExamSet` table. All the data in the column will be lost.
  - Added the required column `assessment_method_id` to the `CompetencyAssessment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_method_id` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `assessment_method_id` to the `ExamSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."CompetencyAssessment" DROP COLUMN "assessment_type",
ADD COLUMN     "assessment_method_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."Exam" DROP COLUMN "assessment_type",
ADD COLUMN     "assessment_method_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "public"."ExamSet" DROP COLUMN "assessment_type",
ADD COLUMN     "assessment_method_id" UUID NOT NULL;

-- DropEnum
DROP TYPE "public"."AssessmentType";

-- CreateTable
CREATE TABLE "public"."AssessmentMethod" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AssessmentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentMethod_name_key" ON "public"."AssessmentMethod"("name");

-- AddForeignKey
ALTER TABLE "public"."ExamSet" ADD CONSTRAINT "ExamSet_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
