import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AspectListRequestDto } from './dto/request/aspect-list.request.dto';
import { AspectNamesRequestDto } from './dto/request/aspect-names.request.dto';
import { AspectListItemDto } from './dto/response/aspect-list.response.dto';
import { AspectNameListDto } from './dto/response/aspect-dropdown.response.dto';
import { ResponsePaginate, PageMetaDto, ResponseItem } from '@app/common/dtos';
import { AspectsQueries } from './aspects.queries';
import { CompetencyAspectStatus, CompetencyDimension } from '@prisma/client';
import { AspectStatisticsResponseDto } from './dto/response/aspect-statistics.response.dto';
import { AspectItemRaw } from './interface/AspectItemRaw';

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
}
