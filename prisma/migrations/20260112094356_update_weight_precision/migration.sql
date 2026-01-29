-- AlterTable
ALTER TABLE "public"."CompetencyAspect" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."CompetencyPillar" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "public"."competency_aspect_assessment_method" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(5,2);
