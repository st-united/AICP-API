import { BadRequestException } from '@nestjs/common';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { CompetencyPillarDto } from '../dto/response/competency-pillar.dto';
import { DomainDto } from '../../domain/dto/response/domain.dto';
import { isNullOrEmpty } from '@app/common/utils/stringUtils';
import { PrismaService } from '../../prisma/prisma.service';

export const validateActivePillars = (
  mindset: CompetencyPillarDto,
  skillset: CompetencyPillarDto,
  toolset: CompetencyPillarDto,
  checkTotalWeight: boolean
) => {
  if (!mindset || !skillset || !toolset) {
    throw new BadRequestException('Các pillar không được rỗng khi khung năng lực ở trạng thái hoạt động');
  }
  if (mindset.dimension !== CompetencyDimension.MINDSET) {
    throw new BadRequestException('Dimension của pillar Mindset không hợp lệ');
  }
  if (skillset.dimension !== CompetencyDimension.SKILLSET) {
    throw new BadRequestException('Dimension của pillar Skillset không hợp lệ');
  }
  if (toolset.dimension !== CompetencyDimension.TOOLSET) {
    throw new BadRequestException('Dimension của pillar Toolset không hợp lệ');
  }
  if (checkTotalWeight) {
    const totalPillarWeight =
      (mindset.weightDimension || 0) + (skillset.weightDimension || 0) + (toolset.weightDimension || 0);
    if (Math.abs(totalPillarWeight - 100) > 0.01) {
      throw new BadRequestException('Tổng trọng số của các pillar phải bằng 100%');
    }
  }
};

export const validatePillarSet = async (
  validatePillar: (pillar: CompetencyPillarDto, isActive: boolean) => Promise<void>,
  mindset: CompetencyPillarDto,
  skillset: CompetencyPillarDto,
  toolset: CompetencyPillarDto,
  isActive: boolean
) => {
  await validatePillar(mindset, isActive);
  await validatePillar(skillset, isActive);
  await validatePillar(toolset, isActive);
};

export const validatePillar = async (pillar: CompetencyPillarDto, isActive: boolean, prismaService: PrismaService) => {
  if (!pillar) {
    return;
  }
  const { aspects } = pillar;

  if (isActive) {
    if (!aspects || aspects.length === 0) {
      throw new BadRequestException('Danh sách tiêu chí không được rỗng');
    }
    const hasInvalidAspect = aspects?.some((aspect) => !aspect?.name || aspect?.weightDimension == null);
    if (hasInvalidAspect) {
      throw new BadRequestException('Thông tin tiêu chí không hợp lệ');
    }
    const totalAspectWeight = aspects.reduce((sum, aspect) => sum + (aspect.weightDimension ?? 0), 0);
    if (Math.abs(totalAspectWeight - 100) > 0.01) {
      throw new BadRequestException('Tổng trọng số của các tiêu chí phải bằng 100%');
    }
  }

  const assessmentMethods = aspects?.flatMap((aspect) => aspect.assessmentMethods ?? []) ?? [];
  const assessmentMethodIds = assessmentMethods.map((method) => method?.id).filter((id): id is string => !!id);
  const uniqueAssessmentMethodIds = Array.from(new Set(assessmentMethodIds));

  if (uniqueAssessmentMethodIds.length > 0) {
    if (isActive) {
      const totalWeight = assessmentMethods.reduce((sum, method) => {
        const weight =
          (method as { weightWithinDimension?: number; weigehtWithinDimension?: number }).weightWithinDimension ??
          (method as { weigehtWithinDimension?: number }).weigehtWithinDimension ??
          0;
        return sum + weight;
      }, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        throw new BadRequestException('Tổng trọng số của các phương pháp đánh giá phải bằng 100%');
      }
    }
    const existingMethods = await prismaService.assessmentMethod.findMany({
      where: { id: { in: uniqueAssessmentMethodIds } },
      select: { id: true },
    });
    if (existingMethods.length !== uniqueAssessmentMethodIds.length) {
      throw new BadRequestException('Phương pháp đánh giá không tồn tại');
    }
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
      where: { id: domain.id, isActive: true },
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
    domainId: params.domainId,
    name: { equals: params.name, mode: 'insensitive' },
    ...(params.excludeId ? { id: { not: params.excludeId } } : {}),
  };

  const existing = await prismaService.competencyFramework.findFirst({
    where,
    select: { id: true },
  });
  if (existing) {
    throw new BadRequestException('Khung năng lực đã có bản phát hành cho lĩnh vực và tên này');
  }
};
