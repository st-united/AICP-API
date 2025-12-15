/*
  Warnings:

  - You are about to drop the column `aspect_id` on the `Course` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_aspect_id_fkey";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "aspect_id";
