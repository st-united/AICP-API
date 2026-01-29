
-- AlterTable
ALTER TABLE "public"."CompetencyFramework" ADD COLUMN     "search_text" TEXT;

-- CreateTable
CREATE TABLE "public"."competency_aspect_assessment_method" (
    "competency_aspect_id" UUID NOT NULL,
    "assessment_method_id" UUID NOT NULL,
    "weight_within_dimension" DECIMAL(3,2),

    CONSTRAINT "competency_aspect_assessment_method_pkey" PRIMARY KEY ("competency_aspect_id","assessment_method_id")
);

-- AddForeignKey
ALTER TABLE "public"."competency_aspect_assessment_method" ADD CONSTRAINT "competency_aspect_assessment_method_competency_aspect_id_fkey" FOREIGN KEY ("competency_aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."competency_aspect_assessment_method" ADD CONSTRAINT "competency_aspect_assessment_method_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
