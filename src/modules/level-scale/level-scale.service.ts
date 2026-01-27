import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LevelScaleDto } from './dto/response/level-scale.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class LevelScaleService {
  constructor(private readonly prismaService: PrismaService) {}

  async getActiveLevelScale(): Promise<ResponseItem<LevelScaleDto>> {
    const levelScales = await this.prismaService.levelScale.findMany({
      where: {
        isActive: true,
      },
      include: {
        levels: {
          where: {
            isActive: true,
          },
          orderBy: {
            numericValue: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const firstLevelScale = levelScales[0];

    if (!firstLevelScale) {
      throw new Error('Không tìm thấy Level Scale nào đang hoạt động');
    }

    const data = {
      id: firstLevelScale.id,
      name: firstLevelScale.name,
      levels: firstLevelScale.levels.map((level) => ({
        id: level.id,
        name: level.name,
        order: level.numericValue,
      })),
    } as LevelScaleDto;

    return new ResponseItem<LevelScaleDto>(data, 'Lấy Level Scale thành công');
  }
}
