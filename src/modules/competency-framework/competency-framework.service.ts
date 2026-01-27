import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateCompetencyFrameworkDto,
  UpdateCompetencyFrameworkDto,
} from './dto/request/create-competency-framework.dto';
import { CompetencyFrameworkDto } from './dto/response/competency-framework.dto';
import { SearchCompetencyFrameworkRequestDto } from './dto/request/search-competency-framework.dto';
import { ChangeStatusCompetencyFrameworkDto } from './dto/request/change-status-competency-framework.dto';
import { convertStringToEnglish, isNullOrEmpty } from '@app/common/utils/stringUtils';
import { DomainDto } from '../domain/dto/response/domain.dto';
import { CompetencyDimension, Prisma } from '@prisma/client';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { Order } from '@Constant/enums';
import {
  validateSinglePillarAspects,
  validateDomain,
  validatePillars,
  validatePublishedUniqueness,
  validateFrameworkLevels,
} from './validator/competency-framework.validator';
import { validateCompetencyFrameworkForPublish } from './validator/validate-competency-framework-publish.validator';
import { persistPillars } from './getter/competency-framework.getter';
import { competencyFrameworkSelect, CompetencyFrameworkPayload } from './types/competency-framework.types';
import { mapCompetencyFrameworkDto } from './mapper/competency-framework.mapper';

@Injectable()
export class CompetencyFrameworkService {
  constructor(private readonly prismaService: PrismaService) {}

  private async validateCreateRequest(request: CreateCompetencyFrameworkDto) {
    const { name, domain, mindset, skillset, toolset, isActive, levels } = request;
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

    await validatePillars(mindset, skillset, toolset, isActive, this.prismaService);
    await validateSinglePillarAspects(mindset.aspects, isActive, this.prismaService);
    await validateSinglePillarAspects(skillset.aspects, isActive, this.prismaService);
    await validateSinglePillarAspects(toolset.aspects, isActive, this.prismaService);
    await validateFrameworkLevels(levels, isActive, this.prismaService);
  }

  private async validateUpdateRequest(competencyFrameworkId: string, request: UpdateCompetencyFrameworkDto) {
    const { name, domain, mindset, skillset, toolset, isActive, levels } = request;

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

    if (domain !== undefined) {
      await validateDomain(domain, effectiveIsActive, this.prismaService);
    }

    if (effectiveIsActive && !isNullOrEmpty(effectiveName) && effectiveDomainId) {
      await validatePublishedUniqueness(this.prismaService, {
        name: effectiveName,
        domainId: effectiveDomainId,
        excludeId: competencyFrameworkId,
      });
    }

    if (mindset || skillset || toolset) {
      await validatePillars(mindset, skillset, toolset, effectiveIsActive, this.prismaService);

      if (mindset) {
        await validateSinglePillarAspects(mindset.aspects, effectiveIsActive, this.prismaService);
      }
      if (skillset) {
        await validateSinglePillarAspects(skillset.aspects, effectiveIsActive, this.prismaService);
      }
      if (toolset) {
        await validateSinglePillarAspects(toolset.aspects, effectiveIsActive, this.prismaService);
      }
    }

    if (levels !== undefined) {
      await validateFrameworkLevels(levels, effectiveIsActive, this.prismaService);
    }
  }

  async createCompetencyFramework(request: CreateCompetencyFrameworkDto): Promise<void> {
    try {
      await this.validateCreateRequest(request);
      const { name, domain, mindset, skillset, toolset, isActive, levels } = request;

      await this.prismaService.$transaction(async (tx) => {
        const competencyFramework = await tx.competencyFramework.create({
          data: {
            name,
            domain: domain ? { connect: { id: domain.id } } : undefined,
            isActive,
          },
        });

        await persistPillars(tx, competencyFramework.id, [mindset, skillset, toolset], levels);
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
      const { name, domain, mindset, skillset, toolset, isActive, levels } = request;

      await this.prismaService.$transaction(async (tx) => {
        const updateData: any = {};

        if (name !== undefined) {
          updateData.name = name;
        }

        if (domain !== undefined) {
          if (domain?.id) {
            updateData.domain = { connect: { id: domain.id } };
          } else {
            updateData.domain = { disconnect: true };
          }
        }

        if (isActive !== undefined) {
          updateData.isActive = isActive;
        }

        if (Object.keys(updateData).length > 0) {
          await tx.competencyFramework.update({
            where: { id: competencyFrameworkId },
            data: updateData,
          });
        }

        if (mindset || skillset || toolset || levels !== undefined) {
          await tx.aspectPillarLevel.deleteMany({
            where: {
              aspectPillar: {
                pillar: {
                  pillarFrameworks: {
                    some: { frameworkId: competencyFrameworkId },
                  },
                },
              },
            },
          });
          await tx.aspectPillar.deleteMany({
            where: {
              pillar: {
                pillarFrameworks: {
                  some: { frameworkId: competencyFrameworkId },
                },
              },
            },
          });
          await tx.pillarFramework.deleteMany({
            where: { frameworkId: competencyFrameworkId },
          });

          if (levels !== undefined) {
            await tx.frameworkLevel.deleteMany({
              where: { frameworkId: competencyFrameworkId },
            });
          }
          await persistPillars(tx, competencyFrameworkId, [mindset, skillset, toolset], levels);
        }
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
              isActice: true,
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
            isActive: framework.domain.isActice,
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
      throw new NotFoundException('Không thể tìm thấy khung năng lực');
    }

    const result = mapCompetencyFrameworkDto(framework);

    return new ResponseItem(result, 'Lấy chi tiết khung năng lực thành công');
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

      await validateCompetencyFrameworkForPublish(framework, this.prismaService);

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
              aspectPillars: {
                some: {
                  pillar: {
                    pillarFrameworks: {
                      some: { frameworkId: competencyFrameworkId },
                    },
                  },
                },
              },
            },
          },
        });
        await tx.aspectPillarLevel.deleteMany({
          where: {
            aspectPillar: {
              pillar: {
                pillarFrameworks: {
                  some: { frameworkId: competencyFrameworkId },
                },
              },
            },
          },
        });
        await tx.aspectPillar.deleteMany({
          where: {
            pillar: {
              pillarFrameworks: {
                some: { frameworkId: competencyFrameworkId },
              },
            },
          },
        });
        await tx.pillarFramework.deleteMany({
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
