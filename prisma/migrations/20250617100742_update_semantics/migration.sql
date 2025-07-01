/*
  Warnings:

  - You are about to drop the column `max_possible_score` on the `UserAnswer` table. All the data in the column will be lost.
  - You are about to drop the column `is_selected` on the `UserAnswerSelection` table. All the data in the column will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CompetencyArea` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `name` to the `CompetencyFramework` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_possible_score` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyArea" DROP CONSTRAINT "CompetencyArea_framework_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyScore" DROP CONSTRAINT "CompetencyScore_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencySkill" DROP CONSTRAINT "CompetencySkill_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_category_id_fkey";

-- DropForeignKey
ALTER TABLE "LearningPathCourse" DROP CONSTRAINT "LearningPathCourse_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "MentorBooking" DROP CONSTRAINT "MentorBooking_competency_focus_fkey";

-- DropForeignKey
ALTER TABLE "MentorCompetency" DROP CONSTRAINT "MentorCompetency_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_competency_area_id_fkey";

-- AlterTable
ALTER TABLE "CompetencyFramework" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "max_possible_score" DECIMAL(5,2) NOT NULL;

-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "max_possible_score";

-- AlterTable
ALTER TABLE "UserAnswerSelection" DROP COLUMN "is_selected";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "CompetencyArea";

-- CreateTable
CREATE TABLE "CompetencyAspect" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competency_area_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "dimension" "CompetencyDimension" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CompetencyAspect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyPillar" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "dimension" "CompetencyDimension" NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CompetencyPillar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CompetencyAspect_name_key" ON "CompetencyAspect"("name");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAspect" ADD CONSTRAINT "CompetencyAspect_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorCompetency" ADD CONSTRAINT "MentorCompetency_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorBooking" ADD CONSTRAINT "MentorBooking_competency_focus_fkey" FOREIGN KEY ("competency_focus") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyPillar" ADD CONSTRAINT "CompetencyPillar_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencySkill" ADD CONSTRAINT "CompetencySkill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
