import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MutateAssessmentMethodDto } from './dto/request/mutate-assessment-method.dto';
import { PageMetaDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { RequestListAssessmentMethodDto } from './dto/request/request-list-assessment-method.dto';
import { AssessmentMethodsQueries } from './assessment-methods.queries';
import { AssessmentMethodRaw } from './interface/AssessmentMethodRaw';
import { ResponseAssessmentMethodDto } from './dto/response/response-assessment-method.dto';
import { plainToInstance } from 'class-transformer';
import { convertStringToEnglish } from '@app/common/utils';
import { ConflictException } from '@nestjs/common';

@Injectable()
export class AssessmentMethodsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assessmentMethodsQueries: AssessmentMethodsQueries
  ) {}

  async list(dto: RequestListAssessmentMethodDto): Promise<ResponsePaginate<ResponseAssessmentMethodDto>> {
    const { dataQuery, countQuery } = this.assessmentMethodsQueries.getAssessmentMethodsList(dto);

    const [data, totalRows] = await this.prisma.$transaction([
      this.prisma.$queryRaw<AssessmentMethodRaw[]>(dataQuery),
      this.prisma.$queryRaw<{ count: number }[]>(countQuery),
    ]);

    const count = totalRows[0]?.count ?? 0;

    const methodsData: ResponseAssessmentMethodDto[] = data.map((item) => {
      return {
        id: item.id,
        name: item.name,
        description: item.description,
        isActive: item.is_active,
      };
    });

    const pageMetaDto = new PageMetaDto({ itemCount: count, pageOptionsDto: dto });

    return new ResponsePaginate<ResponseAssessmentMethodDto>(
      methodsData,
      pageMetaDto,
      'Lấy danh sách phương thức đánh giá thành công'
    );
  }

  async create(dto: MutateAssessmentMethodDto): Promise<ResponseItem<ResponseAssessmentMethodDto>> {
    const existingMethod = await this.prisma.assessmentMethod.findUnique({
      where: { name: dto.name },
    });

    if (existingMethod) {
      throw new ConflictException('Phương thức đánh giá đã tồn tại.');
    }

    const method = await this.prisma.assessmentMethod.create({
      data: {
        name: dto.name,
        description: dto.description || null,
      },
    });
    return new ResponseItem(
      plainToInstance(ResponseAssessmentMethodDto, method, {
        excludeExtraneousValues: true,
      }),
      'Tạo phương thức đánh giá thành công'
    );
  }
}
