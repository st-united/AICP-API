-- CreateEnum
CREATE TYPE "public"."SuggestType" AS ENUM ('MINING_SUGGEST', 'ASSESSMENT_GUIDED');

-- CreateTable
CREATE TABLE "public"."AspectSuggestion" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" "public"."SuggestType" NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "aspect_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AspectSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AspectEvaluation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "mentor_booking_id" UUID NOT NULL,
    "assessor_id" UUID NOT NULL,
    "progress" DECIMAL(3,2) NOT NULL,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AspectEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AspectEvaluationDetail" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aspect_evaluation_id" UUID NOT NULL,
    "aspect_id" UUID NOT NULL,
    "score" DECIMAL(3,2),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AspectEvaluationDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AspectEvaluation_mentor_booking_id_key" ON "public"."AspectEvaluation"("mentor_booking_id");

-- AddForeignKey
ALTER TABLE "public"."AspectSuggestion" ADD CONSTRAINT "AspectSuggestion_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectEvaluation" ADD CONSTRAINT "AspectEvaluation_mentor_booking_id_fkey" FOREIGN KEY ("mentor_booking_id") REFERENCES "public"."MentorBooking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectEvaluation" ADD CONSTRAINT "AspectEvaluation_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectEvaluationDetail" ADD CONSTRAINT "AspectEvaluationDetail_aspect_evaluation_id_fkey" FOREIGN KEY ("aspect_evaluation_id") REFERENCES "public"."AspectEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectEvaluationDetail" ADD CONSTRAINT "AspectEvaluationDetail_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
