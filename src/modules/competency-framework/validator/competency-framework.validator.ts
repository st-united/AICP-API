import { BadRequestException } from '@nestjs/common';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { CompetencyPillarDto as RequestPillarDto } from '../dto/request/create-competency-framework.dto';
import { DomainDto } from '../../domain/dto/response/domain.dto';
import { isNullOrEmpty } from '@app/common/utils/stringUtils';
import { PrismaService } from '../../prisma/prisma.service';
import { AspectLevelDto, FrameworkLevelDto } from '../dto/request/create-competency-framework.dto';
import { isArrayNotNullOrEmpty } from '@app/common/utils/list.utils';

const validateIdsUniqueness = (ids: string[], errorMessage: string) => {
  const uniqueIds = new Set(ids);
  if (uniqueIds.size < ids.length) {
    throw new BadRequestException(errorMessage);
  }
};

const validateEntityExistence = (entityIds: string[], existingEntities: any[], errorMessage: string) => {
  if (existingEntities.length !== entityIds.length) {
    throw new BadRequestException(errorMessage);
  }
};

const validateWeightTotal = (weights: (number | undefined | null)[], errorMessage: string, expectedTotal = 100) => {
  const total = weights.reduce((sum, weight) => sum + (weight ?? 0), 0);
  if (Math.abs(total - expectedTotal) > 0.01) {
    throw new BadRequestException(errorMessage);
  }
};

const getActiveLevels = async (prismaService: PrismaService) => {
  //TODO: Currently, only the default 7 levels are used in the table; this will be changed later when a scoring management module is introduced.
  const levels = await prismaService.level.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  return new Set(levels.map((level) => level.id));
};

const validateDescriptions = <T>(
  items: T[],
  getDescription: (item: T) => string | undefined | null,
  errorMessage: string
) => {
  const hasEmptyDescription = items.some((item) => isNullOrEmpty(getDescription(item)));
  if (hasEmptyDescription) {
    throw new BadRequestException(errorMessage);
  }
};

export const validatePillars = async (
  mindset: RequestPillarDto,
  skillset: RequestPillarDto,
  toolset: RequestPillarDto,
  isSubmit: boolean,
  prismaService: PrismaService
) => {
  if (!mindset || !skillset || !toolset) {
    throw new BadRequestException('Các pillar không được rỗng');
  }

  if (!mindset.id || !skillset.id || !toolset.id) {
    throw new BadRequestException('ID của các pillar không được rỗng');
  }

  const pillarIds = [mindset.id, skillset.id, toolset.id];
  validateIdsUniqueness(pillarIds, 'Các pillar không được trùng nhau');

  const existingPillars = await prismaService.competencyPillar.findMany({
    where: { id: { in: pillarIds } },
    select: { id: true },
  });
  validateEntityExistence(pillarIds, existingPillars, 'Một hoặc nhiều pillar không tồn tại trong hệ thống');

  if (isSubmit) {
    if (!mindset.weightDimension || !skillset.weightDimension || !toolset.weightDimension) {
      throw new BadRequestException('Trọng số của pillar không được rỗng');
    }
    validateWeightTotal(
      [mindset.weightDimension, skillset.weightDimension, toolset.weightDimension],
      'Tổng trọng số của các pillar phải bằng 100%'
    );
  }
};

const validateAspectIds = async (aspectIds: string[], prismaService: PrismaService) => {
  if (!isArrayNotNullOrEmpty(aspectIds)) return;

  validateIdsUniqueness(aspectIds, 'Các tiêu chí không được trùng nhau');

  const existingAspects = await prismaService.competencyAspect.findMany({
    where: { id: { in: aspectIds } },
    select: { id: true },
  });
  validateEntityExistence(aspectIds, existingAspects, 'Một hoặc nhiều tiêu chí không tồn tại trong hệ thống');
};

const validateAspectLevelsInternal = (
  aspects: Array<RequestPillarDto['aspects']>,
  defaultLevelIdSet: Set<string>,
  isSubmit: boolean
) => {
  for (const pillarAspects of aspects) {
    if (!pillarAspects) continue;

    for (const aspect of pillarAspects) {
      const levelIds = aspect.levels?.map((level) => level?.id).filter((id): id is string => !!id) || [];

      const hasInvalidLevelId = levelIds.some((levelId) => !defaultLevelIdSet.has(levelId));
      if (hasInvalidLevelId) {
        throw new BadRequestException(
          'Một hoặc nhiều cấp độ (level) không tồn tại hoặc không còn hoạt động trong hệ thống'
        );
      }

      if (!isSubmit) continue;

      if (!isArrayNotNullOrEmpty(aspect.levels)) {
        throw new BadRequestException('Danh sách cấp độ (level) của tiêu chí không được rỗng');
      }

      if (levelIds.length !== defaultLevelIdSet.size) {
        throw new BadRequestException('Tiêu chí phải bao gồm tất cả các cấp độ (level) mặc định');
      }

      if (isArrayNotNullOrEmpty(aspect.levels)) {
        validateDescriptions(aspect.levels, (level) => level?.description, 'Mô tả của cấp độ (level) không được rỗng');
      }
    }
  }
};

const validateAspectWeights = (aspects: Array<RequestPillarDto['aspects']>) => {
  for (const pillarAspects of aspects) {
    if (!pillarAspects) continue;

    const hasInvalidWeight = pillarAspects.some((aspect) => aspect?.weightDimension == null);
    if (hasInvalidWeight) {
      throw new BadRequestException('Trọng số của tiêu chí không được rỗng');
    }

    const weights = pillarAspects.map((aspect) => aspect.weightDimension);
    validateWeightTotal(weights, 'Tổng trọng số của các tiêu chí phải bằng 100%');
  }
};

export const validateSinglePillarAspects = async (
  pillarAspects: RequestPillarDto['aspects'],
  isSubmit: boolean,
  prismaService: PrismaService
) => {
  if (!pillarAspects) return;

  const aspectIds = pillarAspects.map((aspect) => aspect?.id).filter((id): id is string => !!id);

  if (isSubmit && aspectIds.length === 0) {
    throw new BadRequestException('Danh sách tiêu chí không được rỗng');
  }

  await validateAspectIds(aspectIds, prismaService);

  const defaultLevelIdSet = await getActiveLevels(prismaService);

  validateAspectLevelsInternal([pillarAspects], defaultLevelIdSet, isSubmit);

  if (isSubmit) {
    validateAspectWeights([pillarAspects]);
  }
};

export const validateDomain = async (domain: DomainDto, isActive: boolean, prismaService: PrismaService) => {
  if (!isActive) {
    return;
  }
  if (!domain) {
    throw new BadRequestException('Lĩnh vực không được rỗng');
  }
  if (isActive && isNullOrEmpty(domain.id)) {
    throw new BadRequestException('ID lĩnh vực không được rỗng');
  }
  if (isNullOrEmpty(domain.id)) {
    return;
  }
  try {
    const domainExists = await prismaService.domain.findUnique({
      where: { id: domain.id, isActice: true },
    });
    if (!domainExists) {
      throw new BadRequestException('Lĩnh vực không tồn tại');
    }
  } catch (error) {
    throw new BadRequestException('Lỗi khi xác thực lĩnh vực');
  }
};

export const validatePublishedUniqueness = async (
  prismaService: PrismaService,
  params: {
    name: string;
    domainId: string;
    excludeId?: string;
  }
) => {
  const where: Prisma.CompetencyFrameworkWhereInput = {
    isActive: true,
    name: { equals: params.name, mode: 'insensitive' },
    ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
  };

  const existing = await prismaService.competencyFramework.findFirst({
    where,
    select: { id: true },
  });
  if (existing) {
    throw new BadRequestException('Khung năng lực đã có bản phát hành cho tên này');
  }
};

const validateFrameworkLevelUniqueness = (levelIds: string[]) => {
  validateIdsUniqueness(levelIds, 'Các cấp độ trong khung năng lực không được trùng nhau');
};

const validateFrameworkLevelExistence = (levelIds: string[], defaultLevelIdSet: Set<string>) => {
  if (!isArrayNotNullOrEmpty(levelIds)) return;

  const hasInvalidLevelId = levelIds.some((levelId) => !defaultLevelIdSet.has(levelId));
  if (hasInvalidLevelId) {
    throw new BadRequestException(
      'Một hoặc nhiều cấp độ (level) không tồn tại hoặc không còn hoạt động trong hệ thống'
    );
  }
};

const validateFrameworkLevelSubmission = (
  levels: FrameworkLevelDto[],
  levelIds: string[],
  defaultLevelIdSet: Set<string>
) => {
  if (!isArrayNotNullOrEmpty(levels)) {
    throw new BadRequestException('Danh sách cấp độ trong khung năng lực không được rỗng');
  }

  validateDescriptions(levels, (level) => level.description, 'Mô tả của cấp độ trong khung năng lực không được rỗng');

  if (levelIds.length !== defaultLevelIdSet.size) {
    throw new BadRequestException('Khung năng lực phải bao gồm tất cả các cấp độ (level) mặc định');
  }
};

export const validateFrameworkLevels = async (
  levels: FrameworkLevelDto[],
  isSubmit: boolean,
  prismaService: PrismaService
) => {
  const levelIds = levels.map((level) => level.id);
  validateFrameworkLevelUniqueness(levelIds);

  const defaultLevelIdSet = await getActiveLevels(prismaService);

  validateFrameworkLevelExistence(levelIds, defaultLevelIdSet);

  if (isSubmit) {
    validateFrameworkLevelSubmission(levels, levelIds, defaultLevelIdSet);
  }
};
