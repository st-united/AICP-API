import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CompetencyPillarService } from './competency-pillar.service';
import { CompetencyPillarDto } from './dto/response/competency-pillar.dto';
import { ResponseItem } from '@app/common/dtos';

@ApiTags('Competency Pillar')
@Controller('competency-pillars')
export class CompetencyPillarController {
  constructor(private readonly competencyPillarService: CompetencyPillarService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Lấy tất cả Competency Pillar đang hoạt động',
    description: 'API để lấy danh sách tất cả Competency Pillar có trạng thái isActive = true',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy danh sách Competency Pillar thành công',
    schema: {
      allOf: [
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/CompetencyPillarDto' },
            },
            message: { type: 'string' },
          },
        },
      ],
    },
  })
  async getAllActivePillars(): Promise<ResponseItem<CompetencyPillarDto[]>> {
    return this.competencyPillarService.getAllActivePillars();
  }
}
