import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { University } from '@app/modules/universities/dto/university.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { PageMetaDto, PageOptionsDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { Order } from '@Constant/enums';
import { CreateUniversityDto, UpdateUniversityDto } from '@app/modules/universities/dto/request';
import { SimpleResponse } from '@app/common/dtos/base-response-item.dto';

@Injectable()
export class UniversitiesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {}

  private readonly UNIVERSITIES_API_URL = this.configService.get<string>('UNIVERSITIES_DATA_URL');

  async syncUniversities(): Promise<SimpleResponse<number>> {
    try {
      const response = await this.httpService.get(this.UNIVERSITIES_API_URL).toPromise();
      const universities: University[] = response.data.data;

      if (!universities || universities.length === 0) {
        return new SimpleResponse(0, 'Không có dữ liệu nào từ API để đồng bộ.');
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

        const newUniversities = batch.filter((uni) => !existingCodes.has(uni.code) && !existingNames.has(uni.name));

        if (newUniversities.length === 0) {
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
      }

      return new SimpleResponse(insertCount, `Đã đồng bộ thành công: Insert ${insertCount} trường đại học mới.`);
    } catch (error) {
      return new SimpleResponse(0, `Đã xảy ra lỗi trong quá trình đồng bộ: ${error.message}`);
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
      throw new ConflictException(`Trường đại học có tên '${name}' đã tồn tại`);
    }

    const existingByCode = await this.prismaService.university.findFirst({
      where: { code },
    });
    if (existingByCode) {
      throw new ConflictException(`Trường đại học có mã '${code}' đã tồn tại`);
    }

    return this.prismaService.university.create({
      data: { name, code },
    });
  }

  async updateUniversity(id: string, { name, code }: UpdateUniversityDto): Promise<University> {
    const university = await this.prismaService.university.findUnique({ where: { id } });
    if (!university) {
      throw new NotFoundException(`Không tìm thấy trường đại học có ID ${id}`);
    }

    if (name && name !== university.name) {
      const existingByName = await this.prismaService.university.findFirst({
        where: { name, NOT: { id } },
      });
      if (existingByName) {
        throw new ConflictException(`Trường đại học có tên '${name}' đã tồn tại`);
      }
    }

    if (code && code !== university.code) {
      const existingByCode = await this.prismaService.university.findFirst({
        where: { code, NOT: { id } },
      });
      if (existingByCode) {
        throw new ConflictException(`Trường đại học có mã '${code}' đã tồn tại`);
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

  async getUniversity(id: string): Promise<ResponseItem<University>> {
    const university = await this.prismaService.university.findUnique({
      where: { id },
      select: { id: true, code: true, name: true },
    });

    if (!university) {
      throw new NotFoundException('Trường đại học không tồn tại');
    }

    return new ResponseItem(university, 'Lấy thông tin trường đại học thành công');
  }
}
