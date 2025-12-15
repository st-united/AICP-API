-- CreateEnum
CREATE TYPE "public"."CourseTypes" AS ENUM ('ONLINE', 'OFFLINE', 'ONLINE_OFFLINE');

-- CreateTable
CREATE TABLE "public"."CourseAspect" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "course_id" UUID NOT NULL,
    "aspect_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "CourseAspect_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseAspect_course_id_aspect_id_key" ON "public"."CourseAspect"("course_id", "aspect_id");

-- AddForeignKey
ALTER TABLE "public"."CourseAspect" ADD CONSTRAINT "CourseAspect_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourseAspect" ADD CONSTRAINT "CourseAspect_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;
