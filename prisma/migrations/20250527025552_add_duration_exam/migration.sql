/*
  Warnings:

  - Added the required column `duration` to the `ExamSet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExamSet" ADD COLUMN     "duration" SMALLINT NOT NULL;
