/*
  Warnings:

  - A unique constraint covering the columns `[referral_code]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" VARCHAR,
ADD COLUMN     "dob" TIMESTAMPTZ(6),
ADD COLUMN     "job" VARCHAR,
ADD COLUMN     "province" VARCHAR,
ADD COLUMN     "referral_code" VARCHAR;

-- CreateIndex
CREATE UNIQUE INDEX "User_referral_code_key" ON "User"("referral_code");
