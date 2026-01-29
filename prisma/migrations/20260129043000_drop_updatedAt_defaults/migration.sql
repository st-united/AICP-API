-- Drop DEFAULT values for updatedAt columns to match Prisma @updatedAt directive
-- Prisma Client handles updatedAt automatically, DEFAULT is not needed

-- AlterTable
ALTER TABLE "public"."InterviewRequest" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."MentorTimeSpot" ALTER COLUMN "updatedAt" DROP DEFAULT;
