import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseItem } from '@app/common/dtos';
import { DomainNamesDto } from './dto/domain-names.dto';
import { CreateDomainDto } from './dto/request/create-domain.dto';
import { DomainDto } from './dto/response/domain.dto';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

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
    const existed = await this.prisma.domain.findFirst({
      where: { name: { equals: params.name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existed) {
      throw new BadRequestException('Lĩnh vực đã tồn tại');
    }

    try {
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
        status: created.isActice,
      };

      return new ResponseItem(result, 'Tạo mới lĩnh vực thành công', DomainDto);
    } catch (error) {
      throw new BadRequestException('Không thể tạo mới lĩnh vực');
    }
  }
}
