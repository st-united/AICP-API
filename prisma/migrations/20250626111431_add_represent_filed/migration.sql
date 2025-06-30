/*
  Warnings:

  - Added the required column `represent` to the `CompetencyAspect` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CompetencyAspect" ADD COLUMN     "represent" VARCHAR NOT NULL;
