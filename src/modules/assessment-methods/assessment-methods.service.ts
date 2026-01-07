import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ResponseAssessmentMethodDto } from './dto/response/response-assessment-method.dto';
import { PageMetaDto, ResponsePaginate } from '@app/common/dtos';
import { RequestListAssessmentMethodDto } from './dto/request/request-list-assessment-method.dto';
import { plainToInstance } from 'class-transformer';
import { convertStringToEnglish } from '@app/common/utils';

@Injectable()
export class AssessmentMethodsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(dto?: RequestListAssessmentMethodDto): Promise<ResponsePaginate<ResponseAssessmentMethodDto>> {
    const where: Prisma.AssessmentMethodWhereInput = {};

    if (dto?.name) {
      where.searchText = { contains: convertStringToEnglish(dto.name, true) };
    }

    if (dto?.isActive !== undefined) {
      where.isActive = dto.isActive === 'true';
    }
    const [result, total] = await this.prisma.$transaction([
      this.prisma.assessmentMethod.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: dto.take,
        skip: dto.skip,
      }),
      this.prisma.assessmentMethod.count({ where }),
    ]);
    const methodsData = plainToInstance(ResponseAssessmentMethodDto, result, {
      excludeExtraneousValues: false,
    });
    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: dto });

    return new ResponsePaginate<ResponseAssessmentMethodDto>(
      methodsData,
      pageMetaDto,
      'Lấy danh sách phương thức đánh giá thành công'
    );
  }
}
