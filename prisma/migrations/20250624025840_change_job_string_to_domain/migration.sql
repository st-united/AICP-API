/*
  Warnings:

  - You are about to drop the column `competency_area_id` on the `CompetencyAspect` table. All the data in the column will be lost.
  - You are about to drop the column `competency_area_id` on the `CompetencyScore` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `CompetencySkill` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `competency_area_id` on the `LearningPathCourse` table. All the data in the column will be lost.
  - The primary key for the `MentorCompetency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `competency_area_id` on the `MentorCompetency` table. All the data in the column will be lost.
  - You are about to drop the column `competency_area_id` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `job` on the `User` table. All the data in the column will be lost.
  - Added the required column `pillar_id` to the `CompetencyAspect` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pillar_id` to the `CompetencyScore` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aspect_id` to the `CompetencySkill` table without a default value. This is not possible if the table is not empty.
  - Added the required column `aspect_id` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pillar_id` to the `MentorCompetency` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompetencyAspect" DROP CONSTRAINT "CompetencyAspect_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencyScore" DROP CONSTRAINT "CompetencyScore_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "CompetencySkill" DROP CONSTRAINT "CompetencySkill_category_id_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_category_id_fkey";

-- DropForeignKey
ALTER TABLE "LearningPathCourse" DROP CONSTRAINT "LearningPathCourse_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "MentorCompetency" DROP CONSTRAINT "MentorCompetency_competency_area_id_fkey";

-- DropForeignKey
ALTER TABLE "Portfolio" DROP CONSTRAINT "Portfolio_competency_area_id_fkey";

-- AlterTable
ALTER TABLE "CompetencyAspect" DROP COLUMN "competency_area_id",
ADD COLUMN     "pillar_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompetencyScore" DROP COLUMN "competency_area_id",
ADD COLUMN     "pillar_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompetencySkill" DROP COLUMN "category_id",
ADD COLUMN     "aspect_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "category_id",
ADD COLUMN     "aspect_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "LearningPathCourse" DROP COLUMN "competency_area_id",
ADD COLUMN     "pillar_id" UUID;

-- AlterTable
ALTER TABLE "MentorCompetency" DROP CONSTRAINT "MentorCompetency_pkey",
DROP COLUMN "competency_area_id",
ADD COLUMN     "pillar_id" UUID NOT NULL,
ADD CONSTRAINT "MentorCompetency_pkey" PRIMARY KEY ("mentor_id", "pillar_id");

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "competency_area_id",
ADD COLUMN     "pillar_id" UUID;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "job";

-- CreateTable
CREATE TABLE "_UserDomain" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_UserDomain_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserDomain_B_index" ON "_UserDomain"("B");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAspect" ADD CONSTRAINT "CompetencyAspect_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorCompetency" ADD CONSTRAINT "MentorCompetency_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencySkill" ADD CONSTRAINT "CompetencySkill_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "CompetencyPillar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDomain" ADD CONSTRAINT "_UserDomain_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDomain" ADD CONSTRAINT "_UserDomain_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
