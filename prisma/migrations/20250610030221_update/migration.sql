/*
  Warnings:

  - You are about to drop the column `advanced_certifications` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `foundational_certifications` on the `Portfolio` table. All the data in the column will be lost.
  - You are about to drop the column `intermediate_certifications` on the `Portfolio` table. All the data in the column will be lost.
  - Added the required column `advanced_certification` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foundational_certification` to the `Portfolio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `intermediate_certification` to the `Portfolio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Portfolio" DROP COLUMN "advanced_certifications",
DROP COLUMN "foundational_certifications",
DROP COLUMN "intermediate_certifications",
ADD COLUMN     "advanced_certification" TEXT NOT NULL,
ADD COLUMN     "foundational_certification" TEXT NOT NULL,
ADD COLUMN     "intermediate_certification" TEXT NOT NULL;
