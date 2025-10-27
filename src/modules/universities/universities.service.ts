import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { University } from '@app/modules/universities/dto/university.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PageMetaDto, PageOptionsDto, ResponsePaginate } from '@app/common/dtos';
import { Order } from '@Constant/enums';
import { CreateUniversityDto, UpdateUniversityDto } from '@app/modules/universities/dto/request';

@Injectable()
export class UniversitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  private readonly logger = new Logger(UniversitiesService.name);
  private readonly UNIVERSITIES_API_URL = this.configService.get<string>('UNIVERSITIES_DATA_URL');

  async syncUniversities(): Promise<void> {
    this.logger.log('Bắt đầu quá trình đồng bộ dữ liệu trường đại học...');
    try {
      const response = await this.httpService.get(this.UNIVERSITIES_API_URL).toPromise();
      const universities: University[] = response.data.data;

      if (!universities || universities.length === 0) {
        this.logger.log('Không có dữ liệu nào từ API để đồng bộ.');
        return;
      }

      const batchSize = 1000;
      let insertCount = 0;

      const existingUniversities = await this.prismaService.university.findMany({
        select: { code: true, name: true },
      });
      const existingCodes = new Set(existingUniversities.map((u) => u.code));
      const existingNames = new Set(existingUniversities.map((u) => u.name));

      for (let i = 0; i < universities.length; i += batchSize) {
        const batch = universities.slice(i, i + batchSize);
        this.logger.log(`Đang xử lý lô ${i / batchSize + 1} với ${batch.length} trường...`);

        const newUniversities = batch.filter((uni) => !existingCodes.has(uni.code) && !existingNames.has(uni.name));

        if (newUniversities.length === 0) {
          this.logger.log(`Lô này không có trường mới nào để insert.`);
          continue;
        }

        const createPromises = newUniversities.map((uni) =>
          this.prismaService.university.create({
            data: {
              code: uni.code,
              name: uni.name,
            },
          })
        );

        await this.prismaService.$transaction(createPromises);
        insertCount += newUniversities.length;
        this.logger.log(`Đã insert ${newUniversities.length} trường trong lô ${i / batchSize + 1}`);
      }

      this.logger.log(`Đồng bộ thành công: Đã insert ${insertCount} trường đại học mới!`);
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
        orderBy: { name: Order.ASC },

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

  async createUniversity({ name, code }: CreateUniversityDto): Promise<University> {
    const existingByName = await this.prismaService.university.findFirst({
      where: { name },
    });
    if (existingByName) {
      throw new ConflictException(`University with name '${name}' already exists`);
    }

    const existingByCode = await this.prismaService.university.findFirst({
      where: { code },
    });
    if (existingByCode) {
      throw new ConflictException(`University with code '${code}' already exists`);
    }

    return this.prismaService.university.create({
      data: { name, code },
    });
  }

  async updateUniversity(id: string, { name, code }: UpdateUniversityDto): Promise<University> {
    const university = await this.prismaService.university.findUnique({ where: { id } });
    if (!university) {
      throw new NotFoundException(`University with ID ${id} not found`);
    }

    if (name && name !== university.name) {
      const existingByName = await this.prismaService.university.findFirst({
        where: { name, NOT: { id } },
      });
      if (existingByName) {
        throw new ConflictException(`University with name '${name}' already exists`);
      }
    }

    if (code && code !== university.code) {
      const existingByCode = await this.prismaService.university.findFirst({
        where: { code, NOT: { id } },
      });
      if (existingByCode) {
        throw new ConflictException(`University with code '${code}' already exists`);
      }
    }

    return this.prismaService.university.update({
      where: { id },
      data: {
        name: name ?? university.name,
        code: code ?? university.code,
      },
    });
  }
}
