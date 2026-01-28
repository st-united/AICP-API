import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { isNullOrEmpty } from '@app/common/utils/stringUtils';
import { validateDomain, validatePublishedUniqueness } from './competency-framework.validator';
import { DomainDto } from '../../domain/dto/response/domain.dto';
import { CompetencyDimension } from '@prisma/client';
import { CompetencyFrameworkPayload } from '../types/competency-framework.types';
import { isArrayNotNullOrEmpty } from '@app/common/utils';

export const validateCompetencyFrameworkForPublish = async (
  framework: CompetencyFrameworkPayload | null,
  prismaService: PrismaService
): Promise<void> => {
  if (!framework) {
    throw new BadRequestException('Khung năng lực không tồn tại');
  }

  if (isNullOrEmpty(framework.name)) {
    throw new BadRequestException('Tên khung năng lực không được rỗng');
  }

  await validateDomain({ id: framework.domain?.id } as DomainDto, true, prismaService);

  await validatePublishedUniqueness(prismaService, {
    name: framework.name,
    domainId: framework.domain.id,
    excludeId: framework.id,
  });

  const mindsetPillar = framework.pillars?.find((pf: any) => pf.pillar?.dimension === CompetencyDimension.MINDSET);
  const skillsetPillar = framework.pillars?.find((pf: any) => pf.pillar?.dimension === CompetencyDimension.SKILLSET);
  const toolsetPillar = framework.pillars?.find((pf: any) => pf.pillar?.dimension === CompetencyDimension.TOOLSET);

  if (!mindsetPillar || !skillsetPillar || !toolsetPillar) {
    throw new BadRequestException('Phải có đủ 3 pillars: Mindset, Skillset và Toolset');
  }

  const totalPillarWeight =
    Number(mindsetPillar.weightWithinDimension) +
    Number(skillsetPillar.weightWithinDimension) +
    Number(toolsetPillar.weightWithinDimension);

  if (Math.abs(totalPillarWeight - 1.0) > 0.0001) {
    throw new BadRequestException('Tổng trọng số của các pillar phải bằng 100%');
  }

  const activeLevels = await prismaService.level.findMany({
    where: { isActive: true },
    select: { id: true },
  });
  const activeLevelIds = new Set(activeLevels.map((l) => l.id));
  const activeLevelCount = activeLevelIds.size;

  for (const pillarFramework of (framework.pillars || []) as any[]) {
    const aspectPillars = pillarFramework.pillar?.aspectPillars || [];

    if (!isArrayNotNullOrEmpty(aspectPillars)) {
      throw new BadRequestException(`Pillar ${pillarFramework.pillar?.dimension} phải có ít nhất 1 tiêu chí`);
    }

    const totalAspectWeight = aspectPillars.reduce((sum: number, ap: any) => sum + Number(ap.weightWithinDimension), 0);
    if (Math.abs(totalAspectWeight - 1.0) > 0.0001) {
      throw new BadRequestException(
        `Tổng trọng số của các tiêu chí trong pillar ${pillarFramework.pillar?.dimension} phải bằng 100%`
      );
    }

    for (const aspectPillar of aspectPillars) {
      if (!isArrayNotNullOrEmpty(aspectPillar.levels)) {
        throw new BadRequestException(
          `Tiêu chí "${aspectPillar.aspect?.name}" trong pillar ${pillarFramework.pillar?.dimension} phải có ít nhất 1 cấp độ`
        );
      }

      const aspectLevelIds = aspectPillar.levels.map((l: any) => l.levelId);

      if (aspectLevelIds.length !== activeLevelCount) {
        throw new BadRequestException(
          `Tiêu chí "${aspectPillar.aspect?.name}" trong pillar ${pillarFramework.pillar?.dimension} phải bao gồm tất cả ${activeLevelCount} cấp độ mặc định`
        );
      }

      const hasInvalidLevel = aspectLevelIds.some((id: any) => !activeLevelIds.has(id));
      if (hasInvalidLevel) {
        throw new BadRequestException(
          `Tiêu chí "${aspectPillar.aspect?.name}" trong pillar ${pillarFramework.pillar?.dimension} có cấp độ không hợp lệ`
        );
      }

      const hasEmptyDescription = aspectPillar.levels.some((l: any) => isNullOrEmpty(l.description));
      if (hasEmptyDescription) {
        throw new BadRequestException(
          `Tất cả cấp độ của tiêu chí "${aspectPillar.aspect?.name}" trong pillar ${pillarFramework.pillar?.dimension} phải có mô tả`
        );
      }
    }
  }

  if (!isArrayNotNullOrEmpty(framework.levels as any[])) {
    throw new BadRequestException('Framework phải có ít nhất 1 cấp độ');
  }

  const frameworkLevelIds = (framework.levels as any[]).map((l: any) => l.levelId);
  if (frameworkLevelIds.length !== activeLevelCount) {
    throw new BadRequestException(`Framework phải bao gồm tất cả ${activeLevelCount} cấp độ mặc định của hệ thống`);
  }

  const hasInvalidLevel = frameworkLevelIds.some((id: any) => !activeLevelIds.has(id));
  if (hasInvalidLevel) {
    throw new BadRequestException('Một hoặc nhiều cấp độ trong framework không hợp lệ');
  }

  const hasEmptyDescription = (framework.levels as any[]).some((l: any) => isNullOrEmpty(l.description));
  if (hasEmptyDescription) {
    throw new BadRequestException('Tất cả các cấp độ phải có mô tả');
  }
};
