/*
  Warnings:

  - You are about to drop the column `advanced_certification` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `foundational_certification` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `intermediate_certification` on the `Portfolio` table. All the data in the column will be lost.
  - Added the required column `certifications` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "advanced_certification",
DROP COLUMN "foundational_certification",
DROP COLUMN "intermediate_certification",
ADD COLUMN     "certifications" TEXT NOT NULL;
