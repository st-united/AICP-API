/*
  Warnings:

  - You are about to drop the column `mindset_weight` on the `CompetencyFramework` table. All the data in the column will be lost.
  - You are about to drop the column `skillset_weight` on the `CompetencyFramework` table. All the data in the column will be lost.
  - You are about to drop the column `toolset_weight` on the `CompetencyFramework` table. All the data in the column will be lost.
  - You are about to drop the column `competency_area_id` on the `CompetencySkill` table. All the data in the column will be lost.
  - Added the required column `competency_area_id` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `CompetencySkill` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CompetencySkill" DROP CONSTRAINT "CompetencySkill_competency_area_id_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "competency_area_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "CompetencyFramework" DROP COLUMN "mindset_weight",
DROP COLUMN "skillset_weight",
DROP COLUMN "toolset_weight";

-- AlterTable
ALTER TABLE "CompetencySkill" DROP COLUMN "competency_area_id",
ADD COLUMN     "category_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "MentorBooking" ADD COLUMN     "time_slot" "TimeSlotBooking";

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencySkill" ADD CONSTRAINT "CompetencySkill_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
