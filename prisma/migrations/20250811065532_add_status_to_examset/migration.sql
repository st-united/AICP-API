/*
  Warnings:

  - Made the column `applicable_objects` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_information` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_information` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `overview` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ExamSetStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterTable
ALTER TABLE "ExamSet" ADD COLUMN     "end_date" TIMESTAMPTZ(6),
ADD COLUMN     "start_date" TIMESTAMPTZ(6),
ADD COLUMN     "status" "ExamSetStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "url_image" VARCHAR(255);
