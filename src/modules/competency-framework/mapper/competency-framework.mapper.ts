import { CompetencyDimension } from '@prisma/client';
import {
  CompetencyFrameworkDto,
  LevelDto,
  AspectDto,
  CompetencyPillarDto as PillarDto,
} from '../dto/response/competency-framework.dto';

export const mapLevelDto = (level: any): LevelDto => ({
  id: level.levelId,
  description: level.description,
});

export const mapAspectDto = (aspectPillar: any): AspectDto => ({
  id: aspectPillar.aspect?.id,
  name: aspectPillar.aspect?.name,
  weightDimension: aspectPillar.weightWithinDimension ? Number(aspectPillar.weightWithinDimension) * 100 : 0,
  levels: aspectPillar.levels?.map((level: any) => mapLevelDto(level)) || [],
});

export const mapCompetencyPillarDto = (pillarFramework: any): PillarDto => ({
  id: pillarFramework.pillar?.id,
  name: pillarFramework.pillar?.name,
  dimension: pillarFramework.pillar?.dimension,
  weightDimension: pillarFramework.weightWithinDimension ? Number(pillarFramework.weightWithinDimension) * 100 : 0,
  aspects: pillarFramework.pillar?.aspectPillars?.map((aspectPillar: any) => mapAspectDto(aspectPillar)) || [],
});

export const mapCompetencyFrameworkDto = (framework: any): CompetencyFrameworkDto => {
  const pillars = framework.pillars || [];
  const mindsetPillar = pillars.find((p: any) => p.pillar?.dimension === CompetencyDimension.MINDSET);
  const skillsetPillar = pillars.find((p: any) => p.pillar?.dimension === CompetencyDimension.SKILLSET);
  const toolsetPillar = pillars.find((p: any) => p.pillar?.dimension === CompetencyDimension.TOOLSET);

  return {
    id: framework.id,
    name: framework.name,
    domain: {
      id: framework.domain?.id,
      name: framework.domain?.name,
      description: framework.domain?.description,
      isActive: framework.domain?.isActice,
    },
    mindset: mindsetPillar ? mapCompetencyPillarDto(mindsetPillar) : undefined,
    skillset: skillsetPillar ? mapCompetencyPillarDto(skillsetPillar) : undefined,
    toolset: toolsetPillar ? mapCompetencyPillarDto(toolsetPillar) : undefined,
    isActive: framework.isActive,
    createdAt: framework.createdAt,
    updatedAt: framework.updatedAt,
    levels: framework.levels?.map((level: any) => mapLevelDto(level)) || [],
  };
};

export const mapAspectLevelDto = (level: any) => ({
  id: level.id,
  levelId: level.levelId,
  description: level.description,
  name: level.level?.name,
});

export const mapFrameworkLevelDto = (level: any) => ({
  id: level.id,
  levelId: level.levelId,
  description: level.description,
  name: level.level?.name,
});

export const mapAspectWithLevelsDto = (aspectPillar: any) => ({
  id: aspectPillar.aspect?.id,
  name: aspectPillar.aspect?.name,
  description: aspectPillar.aspect?.description,
  represent: aspectPillar.aspect?.represent,
  dimension: aspectPillar.aspect?.dimension,
  weightDimension: aspectPillar.weightWithinDimension ? Number(aspectPillar.weightWithinDimension) * 100 : undefined,
  levels: aspectPillar.levels?.map((level: any) => mapAspectLevelDto(level)) || [],
});

export const mapPillarDto = (pillarFramework: any) => ({
  id: pillarFramework.pillar?.id,
  name: pillarFramework.pillar?.name,
  dimension: pillarFramework.pillar?.dimension,
  weightDimension: pillarFramework.weightWithinDimension
    ? Number(pillarFramework.weightWithinDimension) * 100
    : undefined,
  aspects:
    pillarFramework.pillar?.aspectPillars?.map((aspectPillar: any) => mapAspectWithLevelsDto(aspectPillar)) || [],
});
