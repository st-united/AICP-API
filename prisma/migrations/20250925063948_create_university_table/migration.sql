/*
  Warnings:

  - You are about to drop the column `university` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "university",
ADD COLUMN     "university_id" UUID;

-- CreateTable
CREATE TABLE "public"."University" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR NOT NULL,
    "name" VARCHAR NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "University_code_key" ON "public"."University"("code");

-- CreateIndex
CREATE INDEX "University_code_name_idx" ON "public"."University"("code", "name");

-- AddForeignKey
ALTER TABLE "public"."User" ADD CONSTRAINT "User_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "public"."University"("id") ON DELETE SET NULL ON UPDATE CASCADE;
