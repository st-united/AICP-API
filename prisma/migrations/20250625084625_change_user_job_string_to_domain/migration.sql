/*
  Warnings:

  - You are about to drop the column `job` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "job";

-- CreateTable
CREATE TABLE "_UserDomain" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_UserDomain_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_UserDomain_B_index" ON "_UserDomain"("B");

-- AddForeignKey
ALTER TABLE "_UserDomain" ADD CONSTRAINT "_UserDomain_A_fkey" FOREIGN KEY ("A") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserDomain" ADD CONSTRAINT "_UserDomain_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
