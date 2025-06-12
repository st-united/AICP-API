/*
  Warnings:

  - You are about to drop the column `competencyFrameworkId` on the `CompetencyArea` table. All the data in the column will be lost.
  - You are about to drop the column `is_completed` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `certificates` on the `Portfolio` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CompetencyArea" DROP CONSTRAINT "CompetencyArea_competencyFrameworkId_fkey";

-- AlterTable
ALTER TABLE "CompetencyArea" DROP COLUMN "competencyFrameworkId";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "is_completed",
ADD COLUMN     "exam_status" "ExamStatus" NOT NULL DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "certificates",
ADD COLUMN     "certificateFiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "experienceFiles" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "CompetencyArea" ADD CONSTRAINT "CompetencyArea_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
