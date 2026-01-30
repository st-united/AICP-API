import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AspectListRequestDto } from './dto/request/aspect-list.request.dto';
import { AspectNamesRequestDto } from './dto/request/aspect-names.request.dto';
import { AspectListItemDto } from './dto/response/aspect-list.response.dto';
import { AspectNameListDto } from './dto/response/aspect-dropdown.response.dto';
import { ResponsePaginate, PageMetaDto, ResponseItem } from '@app/common/dtos';
import { AspectsQueries } from './aspects.queries';
import { CompetencyAspectStatus } from '@prisma/client';
import { AspectStatisticsResponseDto } from './dto/response/aspect-statistics.response.dto';
import { AspectItemRaw } from './interface/AspectItemRaw';
import { CreateAspectRequestDto } from './dto/request/create-aspect.request.dto';
import { UUID } from 'crypto';
import { generateAspectRepresent } from './utils/aspect.helper';
import { AspectDetailResponseDto } from './dto/response/aspect-detail.response.dto';

@Injectable()
export class AspectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aspectsQueries: AspectsQueries
  ) {}

  async list(query: AspectListRequestDto): Promise<ResponsePaginate<AspectListItemDto>> {
    // 1. Get data from Queries
    const { dataQuery, countQuery } = await this.aspectsQueries.getAspectsList(query);

    // Execution - Optimized performance using Promise.all for read-only raw queries
    const [data, totalRows] = await Promise.all([
      this.prisma.$queryRaw<AspectItemRaw[]>(dataQuery),
      this.prisma.$queryRaw<{ count: bigint }[]>(countQuery),
    ]);

    const count = Number(totalRows[0]?.count ?? 0);

    // Dynamic Mapper
    const mappedData: AspectListItemDto[] = data.map((item) => {
      return {
        id: item.id,
        name: item.name,
        pillarId: item.pillar_id,
        status: item.status,
        createdDate: item.created_at,
        assessmentMethods: item.assessment_methods.map((method) => {
          return {
            id: method.id,
            name: method.name,
            weightWithinDimension: method.weight_within_dimension ? Number(method.weight_within_dimension) : 0,
          };
        }),
      };
    });

    const pageMetaDto = new PageMetaDto({ pageOptionsDto: query, itemCount: count });
    return new ResponsePaginate<AspectListItemDto>(mappedData, pageMetaDto, 'Lấy danh sách aspect thành công');
  }

  async getStatistics(): Promise<ResponseItem<AspectStatisticsResponseDto>> {
    const stats = await this.prisma.competencyAspect.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    const result = {
      total: 0,
      draft: 0,
      available: 0,
      referenced: 0,
    };

    for (const item of stats) {
      const count = item._count._all;
      result.total += count;

      switch (item.status) {
        case CompetencyAspectStatus.DRAFT:
          result.draft = count;
          break;
        case CompetencyAspectStatus.AVAILABLE:
          result.available = count;
          break;
        case CompetencyAspectStatus.REFERENCED:
          result.referenced = count;
          break;
      }
    }

    return new ResponseItem(result, 'Lấy danh sách aspect thành công', AspectStatisticsResponseDto);
  }

  async findAspectNamesByPillar(query: AspectNamesRequestDto): Promise<ResponseItem<AspectNameListDto>> {
    const { pillarId, status } = query;
    const aspects = await this.prisma.competencyAspect.findMany({
      where: {
        ...(pillarId && { pillarId }),
        ...(status && status.length > 0 && { status: { in: status } }),
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return new ResponseItem(aspects, 'Lấy danh sách aspect thành công', AspectNameListDto);
  }

  async create(body: CreateAspectRequestDto): Promise<ResponseItem<AspectListItemDto>> {
    const { name, pillarId, isDraft, assessmentMethods = [] } = body;

    // 1. Uniqueness check (pillarId + name)
    const existingAspect = await this.prisma.competencyAspect.findUnique({
      where: {
        pillarId_name: {
          pillarId: pillarId as string,
          name,
        },
      },
      select: { id: true },
    });
    if (existingAspect) {
      throw new BadRequestException(`Aspect trùng tên "${name}" đã tồn tại trong pillar này.`);
    }

    // 2. Validate Pillar
    const pillar = await this.prisma.competencyPillar.findUnique({
      where: { id: pillarId as string },
      select: { dimension: true },
    });
    if (!pillar) {
      throw new BadRequestException('Pillar không tồn tại');
    }

    // 3. Validation for non-draft aspects (Spec 2.2)
    if (!isDraft) {
      if (assessmentMethods.length === 0) {
        throw new BadRequestException('Bắt buộc phải có ít nhất một phương pháp đánh giá khi không phải bản nháp');
      }

      const totalWeight = assessmentMethods.reduce((sum, method) => sum + method.weightWithinDimension, 0);
      if (Math.abs(totalWeight - 1) > 0.001) {
        throw new BadRequestException('Tổng trọng số các phương pháp đánh giá phải bằng 1.0 (100%)');
      }
    }

    // 4. Determine Status
    const status: CompetencyAspectStatus = isDraft ? CompetencyAspectStatus.DRAFT : CompetencyAspectStatus.AVAILABLE;

    // 5. Execution in Transaction
    const result = await this.prisma.$transaction(async (transaction) => {
      // 5.1 Validation for Assessment Methods
      if (assessmentMethods.length > 0) {
        const methodIds = assessmentMethods.map((m) => m.id as string);
        const activeMethodsCount = await transaction.assessmentMethod.count({
          where: {
            id: { in: methodIds },
            isActive: true,
          },
        });
        if (activeMethodsCount !== assessmentMethods.length) {
          throw new BadRequestException('Một hoặc nhiều phương pháp đánh giá không hợp lệ hoặc bị vô hiệu hóa');
        }
      }

      // 5.2 Generate Represent (A1, B2, etc.)
      const nextNumResult = await transaction.$queryRaw<{ max_num: number }[]>`
        SELECT COALESCE(MAX(SUBSTRING(represent FROM 2)::INTEGER), 0) as max_num
        FROM "CompetencyAspect"
        WHERE dimension::text = ${pillar.dimension}
      `;
      const nextNumber = Number(nextNumResult[0]?.max_num ?? 0) + 1;
      const represent = generateAspectRepresent(pillar.dimension, nextNumber);

      // 5.3 Create Aspect
      return transaction.competencyAspect.create({
        data: {
          name,
          pillarId: pillarId as string,
          represent,
          status,
          weightWithinDimension: 0,
          dimension: pillar.dimension,
          assessmentMethods: {
            create: assessmentMethods.map((m) => ({
              assessmentMethodId: m.id as string,
              weightWithinDimension: m.weightWithinDimension,
            })),
          },
        },
        select: {
          id: true,
          name: true,
          pillarId: true,
          status: true,
          createdAt: true,
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
      });
    });

    const mapperData: AspectListItemDto = {
      id: result.id,
      name: result.name,
      pillarId: result.pillarId as UUID,
      status: result.status,
      createdDate: result.createdAt,
      assessmentMethods: (result.assessmentMethods || []).map((am: any) => ({
        id: am.assessmentMethod.id as UUID,
        name: am.assessmentMethod.name,
        weightWithinDimension: am.weightWithinDimension ? Number(am.weightWithinDimension) : 0,
      })),
    };

    return new ResponseItem(mapperData, 'Tạo aspect thành công', AspectListItemDto);
  }

  async findOne(id: string): Promise<ResponseItem<AspectDetailResponseDto>> {
    const aspect = await this.prisma.competencyAspect.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        competencyPillar: true,
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
        aspectPillarFrameworks: {
          select: {
            weightWithinDimension: true,
            pillar: {
              select: {
                framework: {
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
    });

    if (!aspect) {
      throw new NotFoundException('Aspect không tồn tại');
    }

    const result: AspectDetailResponseDto = {
      id: aspect.id,
      name: aspect.name,
      pillarName: aspect.competencyPillar.name,
      description: aspect.description ?? '',
      status: aspect.status,
      assessmentMethods: aspect.assessmentMethods.map((method) => ({
        id: method.assessmentMethod.id,
        name: method.assessmentMethod.name,
        weightWithinDimension: method.weightWithinDimension ? Number(method.weightWithinDimension) : 0,
      })),
      frameworkUsage: aspect.aspectPillarFrameworks.map((apf) => ({
        id: apf.pillar.framework.id,
        frameworkName: apf.pillar.framework.name,
        weightWithinDimension: apf.weightWithinDimension ? Number(apf.weightWithinDimension) : 0,
      })),
    };

    return new ResponseItem(result, 'Lấy chi tiết aspect thành công', AspectDetailResponseDto);
  }
}
