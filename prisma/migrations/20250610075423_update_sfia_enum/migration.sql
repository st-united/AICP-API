/*
  Warnings:

  - The values [FOUNDATION_L1_L2,INTERMEDIATE_L3_L4,ADVANCED_L5_L6,EXPERT_L7] on the enum `SFIALevel` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SFIALevel_new" AS ENUM ('LEVEL_1_AWARENESS', 'LEVEL_2_FOUNDATION', 'LEVEL_3_APPLICATION', 'LEVEL_4_INTEGRATION', 'LEVEL_5_INNOVATION', 'LEVEL_6_LEADERSHIP', 'LEVEL_7_MASTERY');
ALTER TABLE "Level" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "Course" ALTER COLUMN "difficulty_level" TYPE "SFIALevel_new" USING ("difficulty_level"::text::"SFIALevel_new");
ALTER TABLE "Exam" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "Mentor" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "MentorCompetency" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "CompetencySkill" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "CompetencyAssessment" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "CompetencyScore" ALTER COLUMN "sfia_level" TYPE "SFIALevel_new" USING ("sfia_level"::text::"SFIALevel_new");
ALTER TABLE "LearningPath" ALTER COLUMN "target_sfia_level" TYPE "SFIALevel_new" USING ("target_sfia_level"::text::"SFIALevel_new");
ALTER TABLE "Portfolio" ALTER COLUMN "sfia_level_claimed" TYPE "SFIALevel_new" USING ("sfia_level_claimed"::text::"SFIALevel_new");
ALTER TYPE "SFIALevel" RENAME TO "SFIALevel_old";
ALTER TYPE "SFIALevel_new" RENAME TO "SFIALevel";
DROP TYPE "SFIALevel_old";
COMMIT;
