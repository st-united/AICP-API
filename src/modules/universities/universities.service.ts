import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Prisma } from '@prisma/client';
import { UniversityDto } from './dto/university.dto';
import { HttpService } from '@nestjs/axios';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class UniversitiesService {
  private readonly logger = new Logger(UniversitiesService.name);
  private readonly UNIVERSITIES_API_URL = 'https://diemthi.tuyensinh247.com/api/school/search';

  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async syncUniversities() {
    this.logger.log('Bắt đầu quá trình đồng bộ dữ liệu trường đại học...');
    try {
      // 1. Lấy dữ liệu từ API
      const response = await this.httpService.get(this.UNIVERSITIES_API_URL).toPromise();
      const universities = response.data.data as UniversityDto[];

      if (!universities || universities.length === 0) {
        this.logger.log('Không có dữ liệu nào từ API để đồng bộ.');
        return;
      }

      // 2. Chia nhỏ dữ liệu thành các lô (batch) để xử lý
      const batchSize = 1000; // Xử lý 100 trường mỗi lần
      let successCount = 0;

      for (let i = 0; i < universities.length; i += batchSize) {
        const batch = universities.slice(i, i + batchSize);
        this.logger.log(`Đang xử lý lô ${i / batchSize + 1}...`);

        // 3. Sử dụng Prisma Transaction để thực hiện upsert cho mỗi lô
        const upsertPromises = batch.map((uni) =>
          this.prismaService.university.upsert({
            where: { code: uni.code }, // Điều kiện để kiểm tra sự tồn tại
            update: {
              // Dữ liệu cần cập nhật nếu đã tồn tại
              name: uni.name,
            },
            create: {
              // Dữ liệu để tạo mới nếu chưa tồn tại
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

  async getAllUniversities(params: { search?: string; skip?: number; take?: number }) {
    const { search, skip = 0, take = 100 } = params;
    const cacheKey = `universities_select_${search || 'all'}_${skip}_${take}`;

    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const where: Prisma.UniversityWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { code: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

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

    await this.cacheManager.set(cacheKey, { data: universities, total }, 3600);

    return { data: universities, total };
  }
}
