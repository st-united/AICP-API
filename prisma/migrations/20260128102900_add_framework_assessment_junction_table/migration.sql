-- CreateTable
CREATE TABLE "public"."FrameworkAssessment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "assessment_method_id" UUID NOT NULL,
    "weight_within_framework" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FrameworkAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FrameworkAssessment_framework_id_idx" ON "public"."FrameworkAssessment"("framework_id");

-- CreateIndex
CREATE INDEX "FrameworkAssessment_assessment_method_id_idx" ON "public"."FrameworkAssessment"("assessment_method_id");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkAssessment_framework_id_assessment_method_id_key" ON "public"."FrameworkAssessment"("framework_id", "assessment_method_id");

-- AddForeignKey
ALTER TABLE "public"."FrameworkAssessment" ADD CONSTRAINT "FrameworkAssessment_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FrameworkAssessment" ADD CONSTRAINT "FrameworkAssessment_assessment_method_id_fkey" FOREIGN KEY ("assessment_method_id") REFERENCES "public"."AssessmentMethod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
