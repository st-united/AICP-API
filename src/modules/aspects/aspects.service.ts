import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/modules/prisma/prisma.service';
import { AspectDto } from '@app/modules/aspects/dto/response/aspect.dto';

@Injectable()
export class AspectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<AspectDto[]> {
    return await this.prisma.competencyAspect.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        represent: true,
        dimension: true,
      },
    });
  }
}
