/*
  Warnings:

  - You are about to drop the column `criteriaId` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty_level` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the `CriteriaCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionCategory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `category_id` to the `Criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `criteria_id` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level_id` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CriteriaCategory" DROP CONSTRAINT "CriteriaCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "CriteriaCategory" DROP CONSTRAINT "CriteriaCategory_criteria_id_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_criteriaId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionCategory" DROP CONSTRAINT "QuestionCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "QuestionCategory" DROP CONSTRAINT "QuestionCategory_question_id_fkey";

-- AlterTable
ALTER TABLE "Criteria" ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "criteriaId",
DROP COLUMN "difficulty_level",
ADD COLUMN     "criteria_id" UUID NOT NULL,
ADD COLUMN     "level_id" UUID NOT NULL;

-- DropTable
DROP TABLE "CriteriaCategory";

-- DropTable
DROP TABLE "QuestionCategory";

-- DropEnum
DROP TYPE "DifficultyLevel";

-- CreateTable
CREATE TABLE "Level" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Level_name_key" ON "Level"("name");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "Criteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Criteria" ADD CONSTRAINT "Criteria_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
