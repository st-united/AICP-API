import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCompetencyFrameworkDto,
  UpdateCompetencyFrameworkDto,
} from './dto/request/create-competency-framework.dto';
import { CompetencyPillarDto } from './dto/response/competency-pillar.dto';
import { CompetencyFrameworkDto } from './dto/response/competency-framework.dto';
import { SearchCompetencyFrameworkRequestDto } from './dto/request/search-competency-framework.dto';
import { ChangeStatusCompetencyFrameworkDto } from './dto/request/change-status-competency-framework.dto';
import { convertStringToEnglish, isNullOrEmpty } from '@app/common/utils/stringUtils';
import { DomainDto } from '../domain/dto/response/domain.dto';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { log } from 'console';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { Order } from '@Constant/enums';

const competencyFrameworkSelect = {
  id: true,
  name: true,
  isActive: true,
  domain: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
  updatedAt: true,
  pillars: {
    select: {
      id: true,
      name: true,
      dimension: true,
      weightWithinDimension: true,
      aspects: {
        select: {
          id: true,
          name: true,
          description: true,
          represent: true,
          dimension: true,
          weightWithinDimension: true,
          assessmentMethods: {
            select: {
              weightWithinDimension: true,
              assessmentMethod: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

type CompetencyFrameworkPayload = Prisma.CompetencyFrameworkGetPayload<{
  select: typeof competencyFrameworkSelect;
}>;

type PillarPayload = CompetencyFrameworkPayload['pillars'][number];
type AspectPayload = PillarPayload['aspects'][number];
type AssessmentMethodPayload = AspectPayload['assessmentMethods'][number];

@Injectable()
export class CompetencyFrameworkService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly pillarPrefixByDimension: Record<CompetencyDimension, string> = {
    [CompetencyDimension.MINDSET]: 'A',
    [CompetencyDimension.SKILLSET]: 'B',
    [CompetencyDimension.TOOLSET]: 'C',
  };

  private getPillarPrefix(dimension: CompetencyDimension): string {
    return this.pillarPrefixByDimension[dimension];
  }

  private async persistPillars(
    tx: Prisma.TransactionClient,
    frameworkId: string,
    pillars: Array<CompetencyPillarDto | undefined>
  ): Promise<void> {
    for (const pillar of pillars) {
      if (!pillar) continue;
      const createdPillar = await tx.competencyPillar.create({
        data: {
          name: pillar.name,
          dimension: pillar.dimension,
          frameworkId,
          weightWithinDimension: pillar.weightDimension / 100,
        },
      });
      for (const [index, aspect] of (pillar.aspects || []).entries()) {
        const createdAspect = await tx.competencyAspect.create({
          data: {
            name: aspect.name,
            pillarId: createdPillar.id,
            description: aspect.description,
            represent: `${this.getPillarPrefix(pillar.dimension)}${index + 1}`,
            weightWithinDimension: aspect.weightDimension / 100,
            dimension: pillar.dimension,
          },
        });
        for (const method of aspect.assessmentMethods || []) {
          if (!method?.id) {
            throw new BadRequestException('Phương pháp đánh giá không hợp lệ');
          }
          await tx.competencyAspectAssessmentMethod.create({
            data: {
              competencyAspectId: createdAspect.id,
              assessmentMethodId: method.id,
              weightWithinDimension: ((method as { weightWithinDimension?: number }).weightWithinDimension ?? 0) / 100,
            },
          });
        }
      }
    }
  }

  private mapAssessmentMethodDto(item: AssessmentMethodPayload) {
    return {
      id: item.assessmentMethod.id,
      name: item.assessmentMethod.name,
      weigehtWithinDimension: item.weightWithinDimension ? Number(item.weightWithinDimension) * 100 : undefined,
    };
  }

  private mapAspectDto(aspect: AspectPayload) {
    return {
      id: aspect.id,
      name: aspect.name,
      description: aspect.description,
      represent: aspect.represent,
      dimension: aspect.dimension,
      weightDimension: aspect.weightWithinDimension ? Number(aspect.weightWithinDimension) * 100 : undefined,
      assessmentMethods: aspect.assessmentMethods.map((item) => this.mapAssessmentMethodDto(item)),
    };
  }

  private mapPillarDto(pillar: PillarPayload): CompetencyPillarDto {
    return {
      id: pillar.id,
      name: pillar.name,
      dimension: pillar.dimension,
      weightDimension: pillar.weightWithinDimension ? Number(pillar.weightWithinDimension) * 100 : undefined,
      aspects: pillar.aspects.map((aspect) => this.mapAspectDto(aspect)),
    };
  }

  private buildPillarsByDimension(pillars: PillarPayload[]): Record<CompetencyDimension, CompetencyPillarDto> {
    return pillars.reduce(
      (acc, pillar) => {
        acc[pillar.dimension] = this.mapPillarDto(pillar);
        return acc;
      },
      {} as Record<CompetencyDimension, CompetencyPillarDto>
    );
  }

  private validateActivePillars(
    mindset: CompetencyPillarDto,
    skillset: CompetencyPillarDto,
    toolset: CompetencyPillarDto,
    checkTotalWeight: boolean
  ) {
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
  }

  private async validatePillarSet(
    mindset: CompetencyPillarDto,
    skillset: CompetencyPillarDto,
    toolset: CompetencyPillarDto,
    isActive: boolean
  ) {
    await this.validatePillar(mindset, isActive);
    await this.validatePillar(skillset, isActive);
    await this.validatePillar(toolset, isActive);
  }

  private async validateCreateRequest(request: CreateCompetencyFrameworkDto) {
    const { name, domain, mindset, skillset, toolset, isActive } = request;
    if (isActive && isNullOrEmpty(name)) {
      throw new BadRequestException('Tên khung năng lực không được rỗng');
    }
    if (isActive && !isNullOrEmpty(name)) {
      const existingFramework = await this.prismaService.competencyFramework.findFirst({
        where: { searchText: convertStringToEnglish(name, true), isActive: true },
        select: { id: true },
      });
      if (existingFramework) {
        throw new BadRequestException('Tên khung năng lực đã tồn tại');
      }
    }
    await this.validateDomain(domain, isActive);

    if (isActive) {
      this.validateActivePillars(mindset, skillset, toolset, true);
    }
    await this.validatePillarSet(mindset, skillset, toolset, isActive);
  }

  private async validateUpdateRequest(competencyFrameworkId: string, request: UpdateCompetencyFrameworkDto) {
    const { name, domain, mindset, skillset, toolset, isActive } = request;

    const existingFramework = await this.prismaService.competencyFramework.findUnique({
      where: { id: competencyFrameworkId },
      select: { id: true, name: true, domainId: true, isActive: true },
    });
    if (!existingFramework) {
      throw new BadRequestException('Khung năng lực không tồn tại');
    }

    const effectiveIsActive = isActive ?? existingFramework.isActive;
    const effectiveName = name ?? existingFramework.name;
    const effectiveDomainId = domain?.id ?? existingFramework.domainId;

    if (effectiveIsActive && isNullOrEmpty(effectiveName)) {
      throw new BadRequestException('Tên khung năng lực không được rỗng');
    }
    if (effectiveIsActive && !isNullOrEmpty(name)) {
      const duplicateFramework = await this.prismaService.competencyFramework.findFirst({
        where: { name, NOT: { id: competencyFrameworkId } },
        select: { id: true },
      });
      if (duplicateFramework) {
        throw new BadRequestException('Tên khung năng lực đã tồn tại');
      }
    }

    await this.validateDomain(
      effectiveDomainId ? ({ id: effectiveDomainId } as DomainDto) : undefined,
      effectiveIsActive
    );

    if (effectiveIsActive) {
      this.validateActivePillars(mindset, skillset, toolset, false);
    }

    await this.validatePillarSet(mindset, skillset, toolset, effectiveIsActive);
  }

  private async validateDomain(domain: DomainDto, isActive: boolean) {
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
      const domainExists = await this.prismaService.domain.findUnique({
        where: { id: domain.id, isActive: true },
      });
      if (!domainExists) {
        throw new BadRequestException('Lĩnh vực không tồn tại');
      }
    } catch (error) {
      log('Error validating domain:', error);
      throw new BadRequestException('Lỗi khi xác thực lĩnh vực');
    }
  }

  private async validatePillar(pillar: CompetencyPillarDto, isActive: boolean) {
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
      const existingMethods = await this.prismaService.assessmentMethod.findMany({
        where: { id: { in: uniqueAssessmentMethodIds } },
        select: { id: true },
      });
      if (existingMethods.length !== uniqueAssessmentMethodIds.length) {
        throw new BadRequestException('Phương pháp đánh giá không tồn tại');
      }
    }
  }

  async createCompetencyFramework(request: CreateCompetencyFrameworkDto): Promise<void> {
    try {
      await this.validateCreateRequest(request);
      const { name, domain, mindset, skillset, toolset, isActive } = request;

      await this.prismaService.$transaction(async (tx) => {
        const competencyFramework = await tx.competencyFramework.create({
          data: {
            name,
            domain: domain ? { connect: { id: domain.id } } : undefined,
            searchText: name ? convertStringToEnglish(name, true) : '',
            isActive,
          },
        });

        await this.persistPillars(tx, competencyFramework.id, [mindset, skillset, toolset]);
        console.log('Competency framework created with ID:', competencyFramework.id);
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.log('Error creating competency framework:', error);
      throw new BadRequestException('Lỗi khi tạo khung năng lực');
    }
  }

  async updateCompetencyFramework(competencyFrameworkId: string, request: UpdateCompetencyFrameworkDto): Promise<void> {
    try {
      await this.validateUpdateRequest(competencyFrameworkId, request);
      const { name, domain, mindset, skillset, toolset, isActive } = request;

      await this.prismaService.$transaction(async (tx) => {
        await tx.competencyFramework.update({
          where: { id: competencyFrameworkId },
          data: {
            name: name ?? undefined,
            domain: domain?.id ? { connect: { id: domain.id } } : undefined,
            searchText: name ? convertStringToEnglish(name, true) : undefined,
            isActive: isActive,
          },
        });

        await tx.competencyAssessment.deleteMany({
          where: { frameworkId: competencyFrameworkId },
        });
        await tx.competencyAspectAssessmentMethod.deleteMany({
          where: {
            competencyAspect: {
              competencyPillar: { frameworkId: competencyFrameworkId },
            },
          },
        });
        await tx.competencyAspect.deleteMany({
          where: {
            competencyPillar: { frameworkId: competencyFrameworkId },
          },
        });
        await tx.competencyPillar.deleteMany({
          where: { frameworkId: competencyFrameworkId },
        });

        await this.persistPillars(tx, competencyFrameworkId, [mindset, skillset, toolset]);
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.log('Error updating competency framework:', error);
      throw new BadRequestException('Lỗi khi cập nhật khung năng lực');
    }
  }

  async getCompetencyFrameworkList(
    request: SearchCompetencyFrameworkRequestDto
  ): Promise<ResponsePaginate<CompetencyFrameworkDto>> {
    const { search, take, status } = request;
    const where: Prisma.CompetencyFrameworkWhereInput = {
      ...(!isNullOrEmpty(search) && {
        searchText: { contains: convertStringToEnglish(search, true), mode: 'insensitive' },
      }),
      ...{ isActive: status },
    };

    const [itemCount, frameworks] = await this.prismaService.$transaction([
      this.prismaService.competencyFramework.count({ where }),
      this.prismaService.competencyFramework.findMany({
        where,
        orderBy: { createdAt: Order.DESC },
        skip: request.skip,
        take,
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          isActive: true,
          domain: {
            select: {
              id: true,
              name: true,
              description: true,
              isActive: true,
            },
          },
        },
      }),
    ]);

    const data = frameworks.map((framework) => ({
      id: framework.id,
      name: framework.name,
      createdAt: framework.createdAt,
      updatedAt: framework.updatedAt,
      isActive: framework.isActive,
      domain: framework.domain
        ? {
            id: framework.domain.id,
            name: framework.domain.name,
            description: framework.domain.description,
            isActive: framework.domain.isActive,
          }
        : undefined,
    }));

    const meta = new PageMetaDto({ pageOptionsDto: request, itemCount });
    return new ResponsePaginate(data, meta, 'Lấy danh sách khung năng lực thành công');
  }

  async getCompetencyFrameworkDetail(competencyFrameworkId: string): Promise<ResponseItem<CompetencyFrameworkDto>> {
    const framework: CompetencyFrameworkPayload | null = await this.prismaService.competencyFramework.findUnique({
      where: { id: competencyFrameworkId },
      select: competencyFrameworkSelect,
    });

    if (!framework) {
      throw new NotFoundException('Khung năng lực không tồn tại');
    }

    const pillarByDimension = this.buildPillarsByDimension(framework.pillars);

    const result: CompetencyFrameworkDto = {
      id: framework.id,
      name: framework.name,
      isActive: framework.isActive,
      domain: framework.domain,
      createdAt: framework.createdAt,
      updatedAt: framework.updatedAt,
      mindset: pillarByDimension[CompetencyDimension.MINDSET],
      skillset: pillarByDimension[CompetencyDimension.SKILLSET],
      toolset: pillarByDimension[CompetencyDimension.TOOLSET],
    };

    return new ResponseItem(result);
  }

  async changeStatusCompetencyFramework(
    competencyFrameworkId: string,
    request: ChangeStatusCompetencyFrameworkDto
  ): Promise<void> {
    try {
      const framework: CompetencyFrameworkPayload | null = await this.prismaService.competencyFramework.findUnique({
        where: { id: competencyFrameworkId },
        select: competencyFrameworkSelect,
      });

      if (!framework) {
        throw new NotFoundException('Khung năng lực không tồn tại');
      }

      if (request.isActive === framework.isActive) {
        throw new BadRequestException('Khung năng lực đang ở trạng thái này');
      }

      if (request.isActive === false) {
        await this.prismaService.$transaction(async (tx) => {
          await tx.competencyFramework.update({
            where: { id: competencyFrameworkId },
            data: { isActive: false },
          });
        });
        return;
      }

      if (framework.isActive) {
        throw new BadRequestException('Khung năng lực đã ở trạng thái phát hành');
      }

      const duplicateActive = await this.prismaService.competencyFramework.findFirst({
        where: {
          id: { not: competencyFrameworkId },
          domainId: framework.domain.id,
          name: framework.name,
          isActive: true,
        },
        select: { id: true },
      });
      if (duplicateActive) {
        throw new BadRequestException('Khung năng lực đã có bản phát hành cho lĩnh vực và tên này');
      }

      await this.validateDomain({ id: framework.domain.id } as DomainDto, true);

      const pillarByDimension = this.buildPillarsByDimension(framework.pillars);
      const mindset = pillarByDimension[CompetencyDimension.MINDSET];
      const skillset = pillarByDimension[CompetencyDimension.SKILLSET];
      const toolset = pillarByDimension[CompetencyDimension.TOOLSET];

      this.validateActivePillars(mindset, skillset, toolset, true);
      await this.validatePillarSet(mindset, skillset, toolset, true);

      await this.prismaService.$transaction(async (tx) => {
        await tx.competencyFramework.update({
          where: { id: competencyFrameworkId },
          data: { isActive: true },
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.log('Error changing competency framework status:', error);
      throw new BadRequestException('Lỗi khi thay đổi trạng thái khung năng lực');
    }
  }
}
