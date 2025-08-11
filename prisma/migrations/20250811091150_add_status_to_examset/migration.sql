/*
  Warnings:

  - Made the column `applicable_objects` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_information` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `course_information` on table `Course` required. This step will fail if there are existing NULL values in that column.
  - Made the column `overview` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "applicable_objects" SET NOT NULL,
ALTER COLUMN "contact_information" SET NOT NULL,
ALTER COLUMN "course_information" SET NOT NULL,
ALTER COLUMN "overview" SET NOT NULL;
