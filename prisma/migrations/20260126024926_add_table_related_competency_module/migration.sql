-- CreateTable
CREATE TABLE "public"."AspectPillarFramework" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aspect_id" UUID NOT NULL,
    "pillar_framework_id" UUID NOT NULL,
    "weight_within_dimension" DECIMAL(3,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "AspectPillarFramework_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "AspectPillarFramework_aspect_id_idx" ON "public"."AspectPillarFramework"("aspect_id");

-- CreateIndex
CREATE INDEX "AspectPillarFramework_pillar_framework_id_idx" ON "public"."AspectPillarFramework"("pillar_framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "AspectPillarFramework_aspect_id_pillar_framework_id_key" ON "public"."AspectPillarFramework"("aspect_id", "pillar_framework_id");

-- CreateIndex
CREATE INDEX "PillarFramework_pillar_id_idx" ON "public"."PillarFramework"("pillar_id");

-- CreateIndex
CREATE INDEX "PillarFramework_framework_id_idx" ON "public"."PillarFramework"("framework_id");

-- CreateIndex
CREATE UNIQUE INDEX "PillarFramework_pillar_id_framework_id_key" ON "public"."PillarFramework"("pillar_id", "framework_id");

-- AddForeignKey
ALTER TABLE "public"."AspectPillarFramework" ADD CONSTRAINT "AspectPillarFramework_aspect_id_fkey" FOREIGN KEY ("aspect_id") REFERENCES "public"."CompetencyAspect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AspectPillarFramework" ADD CONSTRAINT "AspectPillarFramework_pillar_framework_id_fkey" FOREIGN KEY ("pillar_framework_id") REFERENCES "public"."PillarFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PillarFramework" ADD CONSTRAINT "PillarFramework_pillar_id_fkey" FOREIGN KEY ("pillar_id") REFERENCES "public"."CompetencyPillar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PillarFramework" ADD CONSTRAINT "PillarFramework_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."CompetencyFramework"("id") ON DELETE CASCADE ON UPDATE CASCADE;
