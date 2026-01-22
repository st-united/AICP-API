import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseItem } from '@app/common/dtos';
import { DomainNamesDto } from './dto/domain-names.dto';
import { CreateDomainDto } from '@app/modules/domain/dto/request/create-domain.dto';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { UpdateDomainDto } from '@app/modules/domain/dto/request/update-domain.dto';
import { Prisma } from '@prisma/client';
import { ensureUnaccentIndex } from '@app/common/utils/unaccent-index';
import { PageMetaDto, ResponsePaginate } from '@app/common/dtos';
import { PaginatedSearchDomainDto } from '@app/modules/domain/dto/request/paginated-search-domain.dto';
import { UpdateDomainStatusDto } from '@app/modules/domain/dto/request/update-domain-status.dto';
@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);
  private static unaccentIndexPromise: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {}

  async searchPaging(request: PaginatedSearchDomainDto): Promise<ResponsePaginate<DomainDto>> {
    try {
      const { search, status } = request;
      const keyword = (search ?? '').trim();

      const statusCondition: Prisma.Sql =
        status === undefined || status === null ? Prisma.sql`TRUE` : Prisma.sql`t."is_active" = ${status}`;

      const whereSql = Prisma.sql`${statusCondition}`;

      const columns = ['id', 'name', 'description', 'version', 'is_active', 'created_at', 'updated_at'];

      const fromSql =
        keyword.length > 0
          ? Prisma.sql`
          FROM public.search_unaccent(
            '"Domain"'::regclass, 
            'name', 
            ${keyword}, 
            ${columns}
          ) AS t(
            "id" uuid,
            "name" varchar,
            "description" text,
            "version" varchar,
            "is_active" boolean,
            "created_at" timestamptz,
            "updated_at" timestamptz
          )
        `
          : Prisma.sql`FROM "Domain" AS t`;

      const [domains, totalRows] = await this.prisma.$transaction([
        this.prisma.$queryRaw<
          {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
          }[]
        >(
          Prisma.sql`
          SELECT "id", "name", "description", "is_active" AS "isActive"
          ${fromSql}
          WHERE ${whereSql}
          ORDER BY "created_at" DESC
          LIMIT ${request.take} OFFSET ${request.skip}
        `
        ),
        this.prisma.$queryRaw<{ count: bigint }[]>(
          Prisma.sql`
          SELECT COUNT(*)::bigint AS count
          ${fromSql}
          WHERE ${whereSql}
        `
        ),
      ]);

      const total = Number(totalRows[0]?.count ?? 0);

      const result: DomainDto[] = domains.map((domain) => ({
        id: domain.id,
        name: domain.name,
        description: domain.description,
        isActive: domain.isActive,
      }));

      const pageMetaDto = new PageMetaDto({
        itemCount: total,
        pageOptionsDto: request,
      });

      return new ResponsePaginate(result, pageMetaDto, 'Lấy danh sách lĩnh vực thành công');
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Không thể tìm kiếm lĩnh vực');
    }
  }

  async findNames(): Promise<ResponseItem<DomainNamesDto>> {
    try {
      const domains = await this.prisma.domain.findMany({
        where: { isActice: true },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
        },
      });

      return new ResponseItem(domains, 'Lấy danh sách lĩnh vực thành công', DomainNamesDto);
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách tên lĩnh vực');
    }
  }

  async create(params: CreateDomainDto): Promise<ResponseItem<DomainDto>> {
    try {
      const existed = await this.prisma.domain.findFirst({
        where: { name: { equals: params.name, mode: 'insensitive' } },
        select: { id: true },
      });

      if (existed) {
        throw new BadRequestException('Lĩnh vực đã tồn tại');
      }
      const created = await this.prisma.domain.create({
        data: {
          name: params.name,
          description: params.description,
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActice: true,
        },
      });

      const result: DomainDto = {
        id: created.id,
        name: created.name,
        description: created.description,
        isActive: created.isActice,
      };

      return new ResponseItem(result, 'Tạo mới lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể tạo mới lĩnh vực');
    }
  }

  async update(id: string, params: UpdateDomainDto): Promise<ResponseItem<DomainDto>> {
    try {
      const existedByName = await this.prisma.domain.findFirst({
        where: {
          name: { equals: params.name, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });

      if (existedByName) {
        throw new BadRequestException('Lĩnh vực đã tồn tại');
      }
      const updated = await this.prisma.domain.update({
        where: { id },
        data: {
          name: params.name,
          ...(params.description !== undefined ? { description: params.description } : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          isActice: true,
        },
      });

      const result: DomainDto = {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isActive: updated.isActice,
      };

      return new ResponseItem(result, 'Cập nhật lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể cập nhật lĩnh vực');
    }
  }

  async updateStatus(id: string, params: UpdateDomainStatusDto): Promise<ResponseItem<DomainDto>> {
    try {
      const domain = await this.prisma.domain.findFirst({
        where: { id },
        select: {
          id: true,
          isActice: true,
        },
      });
      if (!domain) {
        throw new NotFoundException('Lĩnh vực không tồn tại');
      }

      if (domain.isActice === params.isActive) {
        throw new BadRequestException('Lĩnh vực đã ở trạng thái này');
      }
      const updated = await this.prisma.domain.update({
        where: { id },
        data: { isActice: params.isActive },
        select: {
          id: true,
          name: true,
          description: true,
          isActice: true,
        },
      });

      const result: DomainDto = {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        isActive: updated.isActice,
      };

      return new ResponseItem(result, 'Cập nhật trạng thái lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      throw new BadRequestException('Không thể cập nhật trạng thái lĩnh vực');
    }
  }

  async findById(id: string): Promise<ResponseItem<DomainDto>> {
    try {
      const domain = await this.prisma.domain.findFirst({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          isActice: true,
        },
      });

      if (!domain) {
        throw new NotFoundException('Lĩnh vực không tồn tại');
      }

      const result: DomainDto = {
        id: domain.id,
        name: domain.name,
        description: domain.description,
        isActive: domain.isActice,
      };

      return new ResponseItem(result, 'Lấy thông tin lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Không thể lấy thông tin lĩnh vực');
    }
  }
}
