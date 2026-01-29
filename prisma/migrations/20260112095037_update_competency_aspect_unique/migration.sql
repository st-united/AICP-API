/*
  Warnings:

  - You are about to alter the column `weight_within_dimension` on the `CompetencyAspect` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(3,2)`.
  - You are about to alter the column `weight_within_dimension` on the `CompetencyPillar` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(3,2)`.
  - You are about to alter the column `weight_within_dimension` on the `competency_aspect_assessment_method` table. The data in that column could be lost. The data in that column will be cast from `Decimal(5,2)` to `Decimal(3,2)`.
  - A unique constraint covering the columns `[pillar_id,name]` on the table `CompetencyAspect` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."CompetencyAspect_name_key";

-- AlterTable
ALTER TABLE "public"."CompetencyAspect" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "public"."CompetencyPillar" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(3,2);

-- AlterTable
ALTER TABLE "public"."competency_aspect_assessment_method" ALTER COLUMN "weight_within_dimension" SET DATA TYPE DECIMAL(3,2);

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyAspect_pillar_id_name_key" ON "public"."CompetencyAspect"("pillar_id", "name");
