-- AlterTable
ALTER TABLE "public"."CompetencyAssessment" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."CompetencyScore" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."CompetencySkill" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."Course" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."LearningPath" ADD COLUMN     "target_level_id" UUID;

-- AlterTable
ALTER TABLE "public"."Level" ADD COLUMN     "code" VARCHAR,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "scale_id" UUID;

-- AlterTable
ALTER TABLE "public"."Mentor" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."MentorCompetency" ADD COLUMN     "level_id" UUID;

-- AlterTable
ALTER TABLE "public"."Portfolio" ADD COLUMN     "level_id" UUID;

-- CreateTable
CREATE TABLE "public"."LevelScale" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "LevelScale_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AspectPillarFrameworkLevel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aspect_pillar_framework_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" TEXT,
    "examples" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AspectPillarFrameworkLevel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FrameworkLevel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "framework_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "FrameworkLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LevelScale_name_key" ON "public"."LevelScale"("name");

-- CreateIndex
CREATE INDEX "AspectPillarFrameworkLevel_aspect_pillar_framework_id_idx" ON "public"."AspectPillarFrameworkLevel"("aspect_pillar_framework_id");

-- CreateIndex
CREATE INDEX "AspectPillarFrameworkLevel_level_id_idx" ON "public"."AspectPillarFrameworkLevel"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "AspectPillarFrameworkLevel_aspect_pillar_framework_id_level_id_key" ON "public"."AspectPillarFrameworkLevel"("aspect_pillar_framework_id", "level_id");

-- CreateIndex
CREATE INDEX "FrameworkLevel_framework_id_idx" ON "public"."FrameworkLevel"("framework_id");

-- CreateIndex
CREATE INDEX "FrameworkLevel_level_id_idx" ON "public"."FrameworkLevel"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "FrameworkLevel_framework_id_level_id_key" ON "public"."FrameworkLevel"("framework_id", "level_id");

-- AddForeignKey
ALTER TABLE "public"."Level" ADD CONSTRAINT "Level_scale_id_fkey" FOREIGN KEY ("scale_id") REFERENCES "public"."LevelScale"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Course" ADD CONSTRAINT "Course_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mentor" ADD CONSTRAINT "Mentor_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MentorCompetency" ADD CONSTRAINT "MentorCompetency_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencySkill" ADD CONSTRAINT "CompetencySkill_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyAssessment" ADD CONSTRAINT "CompetencyAssessment_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompetencyScore" ADD CONSTRAINT "CompetencyScore_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LearningPath" ADD CONSTRAINT "LearningPath_target_level_id_fkey" FOREIGN KEY ("target_level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portfolio" ADD CONSTRAINT "Portfolio_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectPillarFrameworkLevel" ADD CONSTRAINT "AspectPillarFrameworkLevel_aspect_pillar_framework_id_fkey" FOREIGN KEY ("aspect_pillar_framework_id") REFERENCES "public"."AspectPillarFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectPillarFrameworkLevel" ADD CONSTRAINT "AspectPillarFrameworkLevel_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FrameworkLevel" ADD CONSTRAINT "FrameworkLevel_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FrameworkLevel" ADD CONSTRAINT "FrameworkLevel_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."Level"("id") ON DELETE CASCADE ON UPDATE CASCADE;
