/*
  Warnings:

  - You are about to drop the column `pillar_id` on the `CompetencyAspect` table. All the data in the column will be lost.
  - You are about to drop the column `pillar_id` on the `CompetencyScore` table. All the data in the column will be lost.
  - You are about to drop the column `aspect_id` on the `CompetencySkill` table. All the data in the column will be lost.
  - You are about to drop the column `aspect_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `pillar_id` on the `LearningPathCourse` table. All the data in the column will be lost.
  - The primary key for the `MentorCompetency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `pillar_id` on the `MentorCompetency` table. All the data in the column will be lost.
  - You are about to drop the column `pillar_id` on the `Portfolio` table. All the data in the column will be lost.
  - Added the required column `competency_area_id` to the `CompetencyAspect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competency_area_id` to the `CompetencyScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `CompetencySkill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competency_area_id` to the `MentorCompetency` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompetencyAspect" DROP CONSTRAINT "CompetencyAspect_pillar_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyScore" DROP CONSTRAINT "CompetencyScore_pillar_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencySkill" DROP CONSTRAINT "CompetencySkill_aspect_id_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_aspect_id_fkey";

-- DropForeignKey
ALTER TABLE "LearningPathCourse" DROP CONSTRAINT "LearningPathCourse_pillar_id_fkey";

-- DropForeignKey
ALTER TABLE "MentorCompetency" DROP CONSTRAINT "MentorCompetency_pillar_id_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_pillar_id_fkey";

-- AlterTable
ALTER TABLE "CompetencyAspect" DROP COLUMN "pillar_id",
ADD COLUMN     "competency_area_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompetencyScore" DROP COLUMN "pillar_id",
ADD COLUMN     "competency_area_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompetencySkill" DROP COLUMN "aspect_id",
ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "aspect_id",
ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "LearningPathCourse" DROP COLUMN "pillar_id",
ADD COLUMN     "competency_area_id" UUID;

-- AlterTable
ALTER TABLE "MentorCompetency" DROP CONSTRAINT "MentorCompetency_pkey",
DROP COLUMN "pillar_id",
ADD COLUMN     "competency_area_id" UUID NOT NULL,
ADD CONSTRAINT "MentorCompetency_pkey" PRIMARY KEY ("mentor_id", "competency_area_id");

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "pillar_id",
ADD COLUMN     "competency_area_id" UUID;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAspect" ADD CONSTRAINT "CompetencyAspect_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorCompetency" ADD CONSTRAINT "MentorCompetency_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencySkill" ADD CONSTRAINT "CompetencySkill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
