import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { University } from '@app/modules/universities/dto/university.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PageMetaDto, PageOptionsDto, ResponsePaginate } from '@app/common/dtos';

@Injectable()
export class UniversitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(UniversitiesService.name);
  private readonly UNIVERSITIES_API_URL = this.configService.get<string>('UNIVERSITIES_DATA_URL');

  async syncUniversities() {
    this.logger.log('Bắt đầu quá trình đồng bộ dữ liệu trường đại học...');
    try {
      const response = await this.httpService.get(this.UNIVERSITIES_API_URL).toPromise();
      const universities = response.data.data as University[];

      if (!universities || universities.length === 0) {
        this.logger.log('Không có dữ liệu nào từ API để đồng bộ.');
        return;
      }

      const batchSize = 1000;
      let successCount = 0;

      for (let i = 0; i < universities.length; i += batchSize) {
        const batch = universities.slice(i, i + batchSize);
        this.logger.log(`Đang xử lý lô ${i / batchSize + 1}...`);

        const upsertPromises = batch.map((uni) =>
          this.prismaService.university.upsert({
            where: { code: uni.code },
            update: {
              name: uni.name,
            },
            create: {
              code: uni.code,
              name: uni.name,
            },
          })
        );

        await this.prismaService.$transaction(upsertPromises);
        successCount += batch.length;
      }

      this.logger.log(`Đồng bộ thành công ${successCount} trường đại học!`);
    } catch (error) {
      this.logger.error('Đã xảy ra lỗi trong quá trình đồng bộ:', error.stack);
    }
  }

  async getAllUniversities(queries: PageOptionsDto): Promise<ResponsePaginate<University>> {
    const { search, skip, take } = queries;

    const where: Prisma.UniversityWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [result, total] = await this.prismaService.$transaction([
      this.prismaService.university.findMany({
        where,
        select: {
          id: true,
          code: true,
          name: true,
        },
        orderBy: { name: 'asc' },

        skip: skip,
        take: take,
      }),
      this.prismaService.university.count({
        where,
      }),
    ]);

    const pageMetaDto = new PageMetaDto({ itemCount: total, pageOptionsDto: queries });

    return new ResponsePaginate(result, pageMetaDto, 'Lấy danh sách trường đại học thành công');
  }
}
