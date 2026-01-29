import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class AspectsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aspectsQueries: AspectsQueries
  ) {}

  async list(query: AspectListRequestDto): Promise<ResponsePaginate<AspectListItemDto>> {
    // 1. Get data from Queries
    const { dataQuery, countQuery } = await this.aspectsQueries.getAspectsList(query);

    // Execution
    const [data, totalRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<AspectItemRaw[]>(dataQuery),
      this.prisma.$queryRaw<{ count: bigint }[]>(countQuery),
    ]);

    const count = Number(totalRows[0]?.count ?? 0);

    //Mapper
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
            weightWithinDimension: method.weight_within_dimension,
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
    const status = isDraft ? CompetencyAspectStatus.DRAFT : CompetencyAspectStatus.AVAILABLE;

    // 1. Uniqueness check (pillarId + name)
    const existingAspect = await this.prisma.competencyAspect.findUnique({
      where: {
        pillarId_name: {
          pillarId: pillarId as string,
          name,
        },
      },
    });
    if (existingAspect) {
      throw new BadRequestException(`Aspect trùng tên "${name}" đã tồn tại trong pillar này.`);
    }

    // 2. Validate Pillar
    const pillar = await this.prisma.competencyPillar.findUnique({
      where: { id: pillarId as string },
    });
    if (!pillar) {
      throw new BadRequestException('Pillar không tồn tại');
    }

    // 3. Weight Validation for Assessment Methods (if not draft and methods exist)
    if (!isDraft && assessmentMethods.length > 0) {
      const totalWeight = assessmentMethods.reduce((sum, method) => sum + method.weightWithinDimension, 0);
      if (Math.abs(totalWeight - 1) > 0.001) {
        throw new BadRequestException('Tổng trọng số các phương pháp đánh giá phải bằng 1.0 (100%)');
      }
    }

    // 4. Execution in Transaction
    const result = await this.prisma.$transaction(async (transaction) => {
      // Validate Assessment Methods existence/activity
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

      return transaction.competencyAspect.create({
        data: {
          name,
          pillarId: pillarId as string,
          represent: name.slice(0, 2).toUpperCase(),
          status,
          weightWithinDimension: 0.1, // Remove later
          dimension: pillar.dimension,
          assessmentMethods: {
            create: assessmentMethods.map((m) => ({
              assessmentMethodId: m.id as string,
              weightWithinDimension: m.weightWithinDimension,
            })),
          },
        },
        include: {
          assessmentMethods: {
            include: {
              assessmentMethod: true,
            },
          },
        },
      });
    });

    return new ResponseItem(this.mapToListItemDto(result), 'Tạo aspect thành công', AspectListItemDto);
  }

  private mapToListItemDto(item: any): AspectListItemDto {
    return {
      id: item.id,
      name: item.name,
      pillarId: item.pillarId as UUID,
      status: item.status,
      createdDate: item.createdAt,
      assessmentMethods: (item.assessmentMethods || []).map((am: any) => ({
        id: am.assessmentMethodId as UUID,
        name: am.assessmentMethod.name,
        weightWithinDimension: am.weightWithinDimension ? Number(am.weightWithinDimension) : 0,
      })),
    };
  }
}
