import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentMethodsService } from './assessment-methods.service';
import { RequestListAssessmentMethodDto } from './dto/request/request-list-assessment-method.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ResponsePaginate } from '@app/common/dtos';
import { ResponseAssessmentMethodDto } from './dto/response/response-assessment-method.dto';

@ApiTags('Assessment Methods')
@Controller('assessment-methods')
@ApiBearerAuth()
@UseGuards(JwtAccessTokenGuard)
export class AssessmentMethodsController {
  constructor(private readonly assessmentMethodsService: AssessmentMethodsService) {}

  @ApiOperation({ summary: 'List all assessment methods with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of assessment methods retrieved successfully',
    type: ResponsePaginate,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Get()
  async list(@Query() dto: RequestListAssessmentMethodDto): Promise<ResponsePaginate<ResponseAssessmentMethodDto>> {
    return this.assessmentMethodsService.list(dto);
  }
}
