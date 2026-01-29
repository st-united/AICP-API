import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompetencyPillarDto } from './dto/response/competency-pillar.dto';
import { ResponseItem } from '@app/common/dtos';

@Injectable()
export class CompetencyPillarService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllActivePillars(): Promise<ResponseItem<CompetencyPillarDto[]>> {
    const pillars = await this.prismaService.competencyPillar.findMany({
      select: {
        id: true,
        name: true,
        dimension: true,
      },
    });

    const data = pillars.map(
      (pillar) =>
        ({
          id: pillar.id,
          name: pillar.name,
          dimension: pillar.dimension,
        }) as CompetencyPillarDto
    );

    return new ResponseItem<CompetencyPillarDto[]>(data, 'Lấy danh sách Competency Pillar thành công');
  }
}
