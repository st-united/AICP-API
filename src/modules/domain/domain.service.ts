import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseItem } from '@app/common/dtos';
import { DomainNamesDto } from './dto/domain-names.dto';
import { CreateDomainDto } from '@app/modules/domain/dto/request/create-domain.dto';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { UpdateDomainDto } from '@app/modules/domain/dto/request/update-domain.dto';
import { Prisma } from '@prisma/client';
import { convertStringToEnglish, sanitizeString } from '@app/common/utils';
import { PageMetaDto, ResponsePaginate } from '@app/common/dtos';
import { PaginatedSearchDomainDto } from '@app/modules/domain/dto/request/paginated-search-domain.dto';
import { UpdateDomainStatusDto } from '@app/modules/domain/dto/request/update-domain-status.dto';

@Injectable()
export class DomainService {
  private readonly logger = new Logger(DomainService.name);

  constructor(private readonly prisma: PrismaService) {}

  async searchPaging(request: PaginatedSearchDomainDto): Promise<ResponsePaginate<DomainDto>> {
    try {
      const { search, status } = request;

      const where: Prisma.DomainWhereInput = {
        ...(search && search.trim() && { searchText: { contains: convertStringToEnglish(search, true) } }),
        isActice: status,
      };
      const [domains, total] = await this.prisma.$transaction([
        this.prisma.domain.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            isActice: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: request.skip,
          take: request.take,
        }),
        this.prisma.domain.count({ where }),
      ]);

      const result: DomainDto[] = domains.map((domain) => ({
        id: domain.id,
        name: domain.name,
        description: domain.description ?? undefined,
        status: domain.isActice,
      }));

      const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: request });
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

      return new ResponseItem(domains, 'Lấy danh sách domain thành công', DomainNamesDto);
    } catch (error) {
      throw new BadRequestException('Không thể lấy danh sách tên domain');
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
          searchText: convertStringToEnglish(params.name, true),
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
        status: created.isActice,
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
          searchText: convertStringToEnglish(params.name, true),
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
        status: updated.isActice,
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

      if (domain.isActice === params.status) {
        throw new BadRequestException('Lĩnh vực đã ở trạng thái này');
      }
      const updated = await this.prisma.domain.update({
        where: { id },
        data: { isActice: params.status },
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
        description: updated.description ?? undefined,
        status: updated.isActice,
      };

      return new ResponseItem(result, 'Cập nhật trạng thái lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
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
        status: domain.isActice,
      };

      return new ResponseItem(result, 'Lấy thông tin lĩnh vực thành công', DomainDto);
    } catch (error) {
      this.logger.error(error);
      if (error instanceof NotFoundException) throw error;
      throw new BadRequestException('Không thể lấy thông tin lĩnh vực');
    }
  }
}
