import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Prisma } from '@prisma/client';
import { University } from '@app/modules/universities/dto/university.dto';
import { HttpService } from '@nestjs/axios';
import { GetUniversitiesDto } from '@app/modules/universities/dto/request/get-universities.dto';
import { PaginatedResponseDto } from '@app/modules/universities/dto/response/paginated-response.dto';
import { plainToClass } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { REDIS_CLIENT } from '@Constant/redis';
import Redis from 'ioredis';

@Injectable()
export class UniversitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private redisClient: Redis
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

  async getAllUniversities(dto: GetUniversitiesDto): Promise<PaginatedResponseDto> {
    const { search, skip = 0, take = 100 } = dto;
    const cacheKey = `universities_select_${search || 'all'}_${skip}_${take}`;

    const cachedData = await this.redisClient.get(cacheKey);
    if (cachedData) {
      return plainToClass(PaginatedResponseDto, JSON.parse(cachedData));
    }

    const where: Prisma.UniversityWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    // Fetch universities and total count
    const universities = await this.prismaService.university.findMany({
      where,
      select: {
        id: true,
        code: true,
        name: true,
      },
      orderBy: { name: 'asc' },
      skip,
      take,
    });

    const total = await this.prismaService.university.count({ where });

    const data = plainToClass(University, universities);

    const response: PaginatedResponseDto = {
      data,
      total,
      skip,
      take,
    };

    await this.redisClient.set(cacheKey, JSON.stringify(response), 'EX', 3600);

    return response;
  }
}
