/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `Portfolio` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Portfolio_user_id_key" ON "Portfolio"("user_id");
