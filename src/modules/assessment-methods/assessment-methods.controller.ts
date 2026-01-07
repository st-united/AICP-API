import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { AssessmentMethodsService } from './assessment-methods.service';
import { RequestListAssessmentMethodDto } from './dto/request/request-list-assessment-method.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { ResponseAssessmentMethodDto } from './dto/response/response-assessment-method.dto';
import { MutateAssessmentMethodDto } from './dto/request/mutate-assessment-method.dto';

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

  /** Create a new assessment method */
  @ApiOperation({ summary: 'Create a new assessment method' })
  @ApiBody({ type: MutateAssessmentMethodDto })
  @ApiResponse({
    status: 201,
    description: 'Assessment method created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @Post()
  async create(@Body() dto: MutateAssessmentMethodDto): Promise<ResponseItem<ResponseAssessmentMethodDto>> {
    return this.assessmentMethodsService.create(dto);
  }
}
