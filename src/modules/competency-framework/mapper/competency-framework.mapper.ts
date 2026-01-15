import { CompetencyDimension } from '@prisma/client';
import { CompetencyPillarDto } from '../dto/response/competency-pillar.dto';
import { AspectPayload, AssessmentMethodPayload, PillarPayload } from '../types/competency-framework.types';

export const mapAssessmentMethodDto = (item: AssessmentMethodPayload) => ({
  id: item.assessmentMethod.id,
  name: item.assessmentMethod.name,
  weightWithinDimension: item.weightWithinDimension ? Number(item.weightWithinDimension) * 100 : undefined,
});

export const mapAspectDto = (aspect: AspectPayload) => ({
  id: aspect.id,
  name: aspect.name,
  description: aspect.description,
  represent: aspect.represent,
  dimension: aspect.dimension,
  weightDimension: aspect.weightWithinDimension ? Number(aspect.weightWithinDimension) * 100 : undefined,
  assessmentMethods: aspect.assessmentMethods.map((item) => mapAssessmentMethodDto(item)),
});

export const mapPillarDto = (pillar: PillarPayload): CompetencyPillarDto => ({
  id: pillar.id,
  name: pillar.name,
  dimension: pillar.dimension,
  weightDimension: pillar.weightWithinDimension ? Number(pillar.weightWithinDimension) * 100 : undefined,
  aspects: pillar.aspects.map((aspect) => mapAspectDto(aspect)),
});

export const buildPillarsByDimension = (pillars: PillarPayload[]): Record<CompetencyDimension, CompetencyPillarDto> =>
  pillars.reduce(
    (acc, pillar) => {
      acc[pillar.dimension] = mapPillarDto(pillar);
      return acc;
    },
    {} as Record<CompetencyDimension, CompetencyPillarDto>
  );
