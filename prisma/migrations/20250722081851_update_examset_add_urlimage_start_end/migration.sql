-- CreateEnum
CREATE TYPE "ExamSetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "ExamSet" ADD COLUMN     "end_date" TIMESTAMPTZ(6),
ADD COLUMN     "start_date" TIMESTAMPTZ(6),
ADD COLUMN     "status" "ExamSetStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "url_image" VARCHAR(255);
