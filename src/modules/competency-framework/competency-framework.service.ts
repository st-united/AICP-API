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
import { convertStringToEnglish, isNullOrEmpty } from '@app/common/utils';
import { DomainDto } from '../domain/dto/response/domain.dto';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { log } from 'console';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { Order } from '@Constant/enums';
import {
  validateActivePillars,
  validateDomain,
  validatePillar,
  validatePillarSet,
  validatePublishedUniqueness,
} from './validator/competency-framework.validator';
import { persistPillars } from './getter/competency-framework.getter';
import { buildPillarsByDimension } from './mapper/competency-framework.mapper';
import { competencyFrameworkSelect, CompetencyFrameworkPayload } from './types/competency-framework.types';

@Injectable()
export class CompetencyFrameworkService {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateCreateRequest(request: CreateCompetencyFrameworkDto) {
    const { name, domain, mindset, skillset, toolset, isActive } = request;
    if (isActive && isNullOrEmpty(name)) {
      throw new BadRequestException('Tên khung năng lực không được rỗng');
    }
    await validateDomain(domain, isActive, this.prismaService);
    if (isActive && !isNullOrEmpty(name) && domain?.id) {
      await validatePublishedUniqueness(this.prismaService, {
        name,
        domainId: domain.id,
      });
    }

    if (isActive) {
      validateActivePillars(mindset, skillset, toolset, true);
    }
    await validatePillarSet(
      (pillar, active) => validatePillar(pillar, active, this.prismaService),
      mindset,
      skillset,
      toolset,
      isActive
    );
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

    if (existingFramework.isActive) {
      throw new BadRequestException('Không thể chỉnh sửa khung năng lực đang được phát hành');
    }

    const effectiveIsActive = isActive ?? existingFramework.isActive;
    const effectiveName = name ?? existingFramework.name;
    const effectiveDomainId = domain?.id ?? existingFramework.domainId;

    if (effectiveIsActive && isNullOrEmpty(effectiveName)) {
      throw new BadRequestException('Tên khung năng lực không được rỗng');
    }
    if (effectiveIsActive && !isNullOrEmpty(name) && effectiveDomainId) {
      await validatePublishedUniqueness(this.prismaService, {
        name,
        domainId: effectiveDomainId,
        excludeId: competencyFrameworkId,
      });
    }

    await validateDomain(
      effectiveDomainId ? ({ id: effectiveDomainId } as DomainDto) : undefined,
      effectiveIsActive,
      this.prismaService
    );

    if (effectiveIsActive) {
      validateActivePillars(mindset, skillset, toolset, false);
    }

    await validatePillarSet(
      (pillar, active) => validatePillar(pillar, active, this.prismaService),
      mindset,
      skillset,
      toolset,
      effectiveIsActive
    );
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

        await persistPillars(tx, competencyFramework.id, [mindset, skillset, toolset]);
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

        await persistPillars(tx, competencyFrameworkId, [mindset, skillset, toolset]);
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

    const pillarByDimension = buildPillarsByDimension(framework.pillars);

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
      console.log(request.isActive);
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

      await validatePublishedUniqueness(this.prismaService, {
        name: framework.name,
        domainId: framework.domain.id,
        excludeId: competencyFrameworkId,
      });

      await validateDomain({ id: framework.domain.id } as DomainDto, true, this.prismaService);

      const pillarByDimension = buildPillarsByDimension(framework.pillars);
      const mindset = pillarByDimension[CompetencyDimension.MINDSET];
      const skillset = pillarByDimension[CompetencyDimension.SKILLSET];
      const toolset = pillarByDimension[CompetencyDimension.TOOLSET];

      validateActivePillars(mindset, skillset, toolset, true);
      await validatePillarSet(
        (pillar, active) => validatePillar(pillar, active, this.prismaService),
        mindset,
        skillset,
        toolset,
        true
      );

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

  async deleteCompetencyFramework(competencyFrameworkId: string): Promise<void> {
    try {
      const framework = await this.prismaService.competencyFramework.findUnique({
        where: { id: competencyFrameworkId },
        select: { id: true, isActive: true },
      });

      if (!framework) {
        throw new NotFoundException('Khung năng lực không tồn tại');
      }

      if (framework.isActive) {
        throw new BadRequestException('Không thể xóa khung năng lực đang được phát hành');
      }

      await this.prismaService.$transaction(async (tx) => {
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
        await tx.competencyFramework.delete({
          where: { id: competencyFrameworkId },
        });
      });
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      console.log('Error deleting competency framework:', error);
      throw new BadRequestException('Lỗi khi xóa khung năng lực');
    }
  }
}
