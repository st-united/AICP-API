import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseItem } from '@app/common/dtos';
import { DomainNamesDto } from './dto/domain-names.dto';
import { Order } from '@Constant/enums';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService) {}

  async findNames(): Promise<ResponseItem<DomainNamesDto>> {
    try {
      const domains = await this.prisma.domain.findMany({
        where: { isActive: true },
        orderBy: { createdAt: Order.DESC },
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
}
