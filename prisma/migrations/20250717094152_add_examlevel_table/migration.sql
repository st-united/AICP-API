-- CreateEnum
CREATE TYPE "ExamLevelEnum" AS ENUM ('LEVEL_1_STARTER', 'LEVEL_2_EXPLORER', 'LEVEL_3_PRACTITIONER', 'LEVEL_4_INTEGRATOR', 'LEVEL_5_STRATEGIST', 'LEVEL_6_LEADER', 'LEVEL_7_EXPERT');

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "linkImage" TEXT;

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "exam_level_id" UUID;

-- CreateTable
CREATE TABLE "ExamLevel" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "exam_level" "ExamLevelEnum" NOT NULL,
    "name" VARCHAR NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ExamLevel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamLevel_name_key" ON "ExamLevel"("name");

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_exam_level_id_fkey" FOREIGN KEY ("exam_level_id") REFERENCES "ExamLevel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
