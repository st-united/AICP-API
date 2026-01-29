/*
  Warnings:

  - You are about to drop the `competency_aspect_assessment_method` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."competency_aspect_assessment_method" DROP CONSTRAINT "competency_aspect_assessment_method_assessment_method_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."competency_aspect_assessment_method" DROP CONSTRAINT "competency_aspect_assessment_method_competency_aspect_id_fkey";

-- DropTable
DROP TABLE "public"."competency_aspect_assessment_method";

-- CreateTable
CREATE TABLE "public"."CompetencyAspectAssessmentMethod" (
    "competency_aspect_id" UUID NOT NULL,
    "assessment_method_id" UUID NOT NULL,
    "weight_within_dimension" DECIMAL(3,2),

    CONSTRAINT "CompetencyAspectAssessmentMethod_pkey" PRIMARY KEY ("competency_aspect_id","assessment_method_id")
);

-- AddForeignKey
ALTER TABLE "public"."CompetencyAspectAssessmentMethod" ADD CONSTRAINT "CompetencyAspectAssessmentMethod_competency_aspect_id_fkey" FOREIGN KEY ("competency_aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyAspectAssessmentMethod" ADD CONSTRAINT "CompetencyAspectAssessmentMethod_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
