/*
  Warnings:

  - You are about to drop the column `exam_status` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `level_of_domain` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `total_score` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `domain_id` on the `ExamSet` table. All the data in the column will be lost.
  - You are about to drop the column `duration` on the `ExamSet` table. All the data in the column will be lost.
  - You are about to drop the column `time_slot` on the `MentorBooking` table. All the data in the column will be lost.
  - You are about to drop the column `criteria_id` on the `Question` table. All the data in the column will be lost.
  - You are about to drop the column `exam_set_id` on the `UserAnswer` table. All the data in the column will be lost.
  - You are about to alter the column `manual_score` on the `UserAnswer` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Decimal(5,2)`.
  - You are about to alter the column `auto_score` on the `UserAnswer` table. The data in that column could be lost. The data in that column will be cast from `Real` to `Decimal(5,2)`.
  - You are about to drop the `CategoryDomain` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Criteria` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dimension` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `framework_id` to the `ExamSet` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeric_value` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sfia_level` to the `Level` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sfia_level` to the `Mentor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `competency_skill_id` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `exam_id` to the `UserAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_possible_score` to the `UserAnswer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CognitiveLoad" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AssessmentType" AS ENUM ('SELF_ASSESSMENT', 'PEER_REVIEW', 'MANAGER_REVIEW', 'PRACTICAL_SKILLS', 'PORTFOLIO_REVIEW', 'COMPREHENSIVE');

-- CreateEnum
CREATE TYPE "ReadyToWorkTier" AS ENUM ('TIER_1_PRODUCTION', 'TIER_2_TEAM', 'TIER_3_MENTORED', 'NOT_READY');

-- CreateEnum
CREATE TYPE "CompetencyDimension" AS ENUM ('MINDSET', 'SKILLSET', 'TOOLSET');

-- CreateEnum
CREATE TYPE "LearningStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED');

-- DropForeignKey
ALTER TABLE "CategoryDomain" DROP CONSTRAINT "CategoryDomain_category_id_fkey";

-- DropForeignKey
ALTER TABLE "CategoryDomain" DROP CONSTRAINT "CategoryDomain_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_domainId_fkey";

-- DropForeignKey
ALTER TABLE "Criteria" DROP CONSTRAINT "Criteria_category_id_fkey";

-- DropForeignKey
ALTER TABLE "ExamSet" DROP CONSTRAINT "ExamSet_domain_id_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_criteria_id_fkey";

-- DropForeignKey
ALTER TABLE "UserAnswer" DROP CONSTRAINT "UserAnswer_exam_set_id_fkey";

-- AlterTable
ALTER TABLE "AnswerOption" ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "order_index" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "dimension" "CompetencyDimension" NOT NULL;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "course_type" VARCHAR DEFAULT 'ONLINE',
ADD COLUMN     "difficulty_level" "SFIALevel",
ADD COLUMN     "duration_hours" SMALLINT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Domain" ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "version" VARCHAR NOT NULL DEFAULT '1.0';

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "exam_status",
DROP COLUMN "level_of_domain",
DROP COLUMN "total_score",
ADD COLUMN     "assessment_type" "AssessmentType" NOT NULL DEFAULT 'SELF_ASSESSMENT',
ADD COLUMN     "completion_percent" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "is_completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mindset_score" DECIMAL(3,2),
ADD COLUMN     "overall_score" DECIMAL(3,2),
ADD COLUMN     "ready_to_work_tier" "ReadyToWorkTier",
ADD COLUMN     "reviewer_id" UUID,
ADD COLUMN     "sfia_level" "SFIALevel",
ADD COLUMN     "skillset_score" DECIMAL(3,2),
ADD COLUMN     "time_spent_minutes" SMALLINT,
ADD COLUMN     "toolset_score" DECIMAL(3,2),
ALTER COLUMN "exam_set_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ExamSet" DROP COLUMN "domain_id",
DROP COLUMN "duration",
ADD COLUMN     "assessment_type" "AssessmentType" NOT NULL DEFAULT 'SELF_ASSESSMENT',
ADD COLUMN     "framework_id" UUID NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "is_adaptive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passing_score" DECIMAL(3,2) DEFAULT 4,
ADD COLUMN     "time_limit_minutes" SMALLINT;

-- AlterTable
ALTER TABLE "ExamSetQuestion" ADD COLUMN     "is_required" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "numeric_value" SMALLINT NOT NULL,
ADD COLUMN     "sfia_level" "SFIALevel" NOT NULL;

-- AlterTable
ALTER TABLE "Mentor" ADD COLUMN     "max_mentees" SMALLINT DEFAULT 5,
ADD COLUMN     "sfia_level" "SFIALevel" NOT NULL;

-- AlterTable
ALTER TABLE "MentorBooking" DROP COLUMN "time_slot",
ADD COLUMN     "competency_focus" UUID,
ALTER COLUMN "scheduled_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "criteria_id",
ADD COLUMN     "avg_score" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "cognitive_load" "CognitiveLoad" DEFAULT 'MEDIUM',
ADD COLUMN     "competency_skill_id" UUID NOT NULL,
ADD COLUMN     "completion_rate" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "difficulty_weight" SMALLINT NOT NULL DEFAULT 1,
ADD COLUMN     "discrimination_index" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "estimated_time_minutes" SMALLINT DEFAULT 2,
ADD COLUMN     "industry_context" VARCHAR DEFAULT 'GENERAL',
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "last_analyzed" TIMESTAMPTZ(6),
ADD COLUMN     "scenario_based" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language_preference" VARCHAR DEFAULT 'en',
ADD COLUMN     "position" VARCHAR,
ADD COLUMN     "timezone" VARCHAR DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "UserAnswer" DROP COLUMN "exam_set_id",
ADD COLUMN     "attempt_count" SMALLINT DEFAULT 1,
ADD COLUMN     "confidence_level" SMALLINT,
ADD COLUMN     "exam_id" UUID NOT NULL,
ADD COLUMN     "final_score" DECIMAL(5,2),
ADD COLUMN     "max_possible_score" DECIMAL(5,2) NOT NULL,
ADD COLUMN     "raw_score" DECIMAL(5,2) DEFAULT 0,
ADD COLUMN     "score_percentage" DECIMAL(3,2) DEFAULT 0,
ADD COLUMN     "time_spent_seconds" SMALLINT,
ALTER COLUMN "manual_score" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "auto_score" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "UserAnswerSelection" ADD COLUMN     "is_selected" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "CategoryDomain";

-- DropTable
DROP TABLE "Criteria";

-- CreateTable
CREATE TABLE "MentorCompetency" (
    "mentor_id" UUID NOT NULL,
    "competency_area_id" UUID NOT NULL,
    "sfia_level" "SFIALevel" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MentorCompetency_pkey" PRIMARY KEY ("mentor_id","competency_area_id")
);

-- CreateTable
CREATE TABLE "CompetencyFramework" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "version" VARCHAR NOT NULL DEFAULT '1.0',
    "mindset_weight" DECIMAL(3,2) NOT NULL DEFAULT 0.4,
    "skillset_weight" DECIMAL(3,2) NOT NULL DEFAULT 0.35,
    "toolset_weight" DECIMAL(3,2) NOT NULL DEFAULT 0.25,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CompetencyFramework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyArea" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "dimension" "CompetencyDimension" NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "competencyFrameworkId" UUID,

    CONSTRAINT "CompetencyArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencySkill" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "competency_area_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "sfia_level" "SFIALevel" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CompetencySkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyAssessment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "exam_id" UUID,
    "assessor_id" UUID,
    "mindset_score" DECIMAL(3,2) NOT NULL,
    "skillset_score" DECIMAL(3,2) NOT NULL,
    "toolset_score" DECIMAL(3,2) NOT NULL,
    "overall_score" DECIMAL(3,2) NOT NULL,
    "sfia_level" "SFIALevel" NOT NULL,
    "ready_to_work_tier" "ReadyToWorkTier",
    "certification_date" TIMESTAMP(3),
    "expiry_date" TIMESTAMP(3),
    "assessment_type" "AssessmentType" NOT NULL,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CompetencyAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompetencyScore" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "assessment_id" UUID NOT NULL,
    "competency_area_id" UUID NOT NULL,
    "sfia_level" "SFIALevel" NOT NULL,
    "evidence_count" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompetencyScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPath" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "target_sfia_level" "SFIALevel" NOT NULL,
    "estimated_duration_weeks" SMALLINT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "generated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LearningPath_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningPathCourse" (
    "learning_path_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "order_index" SMALLINT NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "competency_area_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningPathCourse_pkey" PRIMARY KEY ("learning_path_id","course_id")
);

-- CreateTable
CREATE TABLE "UserLearningProgress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "course_id" UUID NOT NULL,
    "learning_path_id" UUID,
    "status" "LearningStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress_percentage" DECIMAL(3,2) DEFAULT 0,
    "started_at" TIMESTAMPTZ(6),
    "completed_at" TIMESTAMPTZ(6),
    "time_spent_hours" DECIMAL(5,2) DEFAULT 0,
    "rating" SMALLINT,
    "feedback" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserLearningProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Portfolio" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "linked_in_url" TEXT,
    "github_url" TEXT,
    "certificates" JSONB NOT NULL DEFAULT '[]',
    "competency_area_id" UUID,
    "sfia_level_claimed" "SFIALevel",
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Portfolio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationalMetrics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "domain_id" UUID NOT NULL,
    "metricDate" TIMESTAMPTZ(6) NOT NULL,
    "total_users" SMALLINT NOT NULL,
    "assessed_users" SMALLINT NOT NULL,
    "avg_overall_score" DECIMAL(3,2),
    "avg_mindset_score" DECIMAL(3,2),
    "avg_skillset_score" DECIMAL(3,2),
    "avg_toolset_score" DECIMAL(3,2),
    "ready_to_work_count" SMALLINT DEFAULT 0,
    "tier_1_count" SMALLINT DEFAULT 0,
    "tier_2_count" SMALLINT DEFAULT 0,
    "tier_3_count" SMALLINT DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "OrganizationalMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentSession" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_id" UUID NOT NULL,
    "session_data" JSONB,
    "last_question_index" SMALLINT DEFAULT 0,
    "time_remaining_seconds" SMALLINT,
    "is_paused" BOOLEAN NOT NULL DEFAULT false,
    "browser_info" TEXT,
    "ip_address" INET,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AssessmentSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_competency_skill_id_fkey" FOREIGN KEY ("competency_skill_id") REFERENCES "CompetencySkill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnswer" ADD CONSTRAINT "UserAnswer_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamSet" ADD CONSTRAINT "ExamSet_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorCompetency" ADD CONSTRAINT "MentorCompetency_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "Mentor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorCompetency" ADD CONSTRAINT "MentorCompetency_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorBooking" ADD CONSTRAINT "MentorBooking_competency_focus_fkey" FOREIGN KEY ("competency_focus") REFERENCES "CompetencyArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyFramework" ADD CONSTRAINT "CompetencyFramework_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyArea" ADD CONSTRAINT "CompetencyArea_competencyFrameworkId_fkey" FOREIGN KEY ("competencyFrameworkId") REFERENCES "CompetencyFramework"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencySkill" ADD CONSTRAINT "CompetencySkill_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "CompetencyFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompetencyScore" ADD CONSTRAINT "CompetencyScore_assessment_id_fkey" FOREIGN KEY ("assessment_id") REFERENCES "CompetencyAssessment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPath" ADD CONSTRAINT "LearningPath_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "CompetencyFramework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "LearningPath"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningPathCourse" ADD CONSTRAINT "LearningPathCourse_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLearningProgress" ADD CONSTRAINT "UserLearningProgress_learning_path_id_fkey" FOREIGN KEY ("learning_path_id") REFERENCES "LearningPath"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Portfolio" ADD CONSTRAINT "Portfolio_competency_area_id_fkey" FOREIGN KEY ("competency_area_id") REFERENCES "CompetencyArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrganizationalMetrics" ADD CONSTRAINT "OrganizationalMetrics_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentSession" ADD CONSTRAINT "AssessmentSession_exam_id_fkey" FOREIGN KEY ("exam_id") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
