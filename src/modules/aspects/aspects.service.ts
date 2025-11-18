import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AspectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
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
