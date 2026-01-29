import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LevelScaleService } from './level-scale.service';
import { LevelScaleDto } from './dto/response/level-scale.dto';
import { ResponseItem } from '@app/common/dtos';

@ApiTags('Level Scale')
@Controller('level-scales')
export class LevelScaleController {
  constructor(private readonly levelScaleService: LevelScaleService) {}

  @Get('active')
  @ApiOperation({
    summary: 'Lấy Level Scale đang hoạt động',
    description: 'API để lấy Level Scale đầu tiên có trạng thái isActive = true và các Level tương ứng',
  })
  @ApiResponse({
    status: 200,
    description: 'Lấy Level Scale thành công',
    schema: {
      allOf: [
        {
          properties: {
            data: { $ref: '#/components/schemas/LevelScaleDto' },
            message: { type: 'string' },
          },
        },
      ],
    },
  })
  async getActiveLevelScale(): Promise<ResponseItem<LevelScaleDto>> {
    return this.levelScaleService.getActiveLevelScale();
  }
}
