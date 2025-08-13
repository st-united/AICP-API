/*
  Warnings:

  - You are about to drop the column `linkImage` on the `Course` table. All the data in the column will be lost.
  - Added the required column `applicable_objects` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_information` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_information` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overview` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "linkImage",
ADD COLUMN     "applicable_objects" TEXT NULL,
ADD COLUMN     "contact_information" TEXT NULL,
ADD COLUMN     "course_information" TEXT NULL,
ADD COLUMN     "link_image" TEXT NULL,
ADD COLUMN     "overview" TEXT NULL,
ALTER COLUMN "url" DROP NOT NULL;
