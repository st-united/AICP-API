/*
  Warnings:

  - You are about to drop the column `phone_zalo_verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "phone_zalo_verified",
ADD COLUMN     "zalo_verified" BOOLEAN NOT NULL DEFAULT false;
