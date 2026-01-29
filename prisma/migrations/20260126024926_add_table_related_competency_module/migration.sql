-- CreateTable
CREATE TABLE "public"."AspectPillar" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aspect_id" UUID NOT NULL,
    "pillar_id" UUID NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AspectPillar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PillarFramework" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "pillar_id" UUID NOT NULL,
    "framework_id" UUID NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "PillarFramework_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AspectPillar_aspect_id_pillar_id_key" ON "public"."AspectPillar"("aspect_id", "pillar_id");

-- CreateIndex
CREATE UNIQUE INDEX "PillarFramework_pillar_id_framework_id_key" ON "public"."PillarFramework"("pillar_id", "framework_id");

-- AddForeignKey
ALTER TABLE "public"."AspectPillar" ADD CONSTRAINT "AspectPillar_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectPillar" ADD CONSTRAINT "AspectPillar_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "public"."CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PillarFramework" ADD CONSTRAINT "PillarFramework_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "public"."CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PillarFramework" ADD CONSTRAINT "PillarFramework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
