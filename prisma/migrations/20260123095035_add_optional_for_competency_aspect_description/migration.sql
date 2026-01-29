-- CreateEnum
CREATE TYPE "public"."CompetencyAspectStatus" AS ENUM ('DRAFT', 'AVAILABLE', 'REFERENCED');

-- AlterTable
ALTER TABLE "public"."CompetencyAspect" ADD COLUMN     "status" "public"."CompetencyAspectStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "public"."CompetencyAspect" ALTER COLUMN "description" DROP NOT NULL;