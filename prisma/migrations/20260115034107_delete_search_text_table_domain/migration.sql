/*
  Warnings:

  - You are about to drop the column `search_text` on the `Domain` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Domain" DROP COLUMN "search_text";
