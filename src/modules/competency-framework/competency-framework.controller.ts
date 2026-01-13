import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { CompetencyFrameworkService } from './competency-framework.service';
import {
  CreateCompetencyFrameworkDto,
  UpdateCompetencyFrameworkDto,
} from './dto/request/create-competency-framework.dto';
import { Roles } from '../auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { SearchCompetencyFrameworkRequestDto } from './dto/request/search-competency-framework.dto';
import { ChangeStatusCompetencyFrameworkDto } from './dto/request/change-status-competency-framework.dto';

@ApiTags('competency-framework')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('competency-framework')
export class CompetencyFrameworkController {
  constructor(private readonly competencyFrameworkService: CompetencyFrameworkService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN)
  @ApiBody({ type: CreateCompetencyFrameworkDto })
  @ApiOperation({ summary: 'Create a new competency framework' })
  @ApiResponse({ status: 200, description: 'Competency framework created successfully' })
  async createCompetencyFramework(@Body() request: CreateCompetencyFrameworkDto): Promise<void> {
    await this.competencyFrameworkService.createCompetencyFramework(request);
  }

  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get competency framework list' })
  @ApiResponse({ status: 200, description: 'Competency framework list fetched successfully' })
  async getCompetencyFrameworkList(@Query() request: SearchCompetencyFrameworkRequestDto) {
    return this.competencyFrameworkService.getCompetencyFrameworkList(request);
  }

  @Get(':competencyFrameworkId')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get competency framework detail' })
  @ApiResponse({ status: 200, description: 'Competency framework detail fetched successfully' })
  async getCompetencyFrameworkDetail(@Param('competencyFrameworkId', ParseUUIDPipe) competencyFrameworkId: string) {
    return this.competencyFrameworkService.getCompetencyFrameworkDetail(competencyFrameworkId);
  }

  @Patch(':competencyFrameworkId')
  @Roles(UserRoleEnum.ADMIN)
  @ApiBody({ type: UpdateCompetencyFrameworkDto })
  @ApiOperation({ summary: 'Update a competency framework' })
  @ApiResponse({ status: 200, description: 'Competency framework updated successfully' })
  async updateCompetencyFramework(
    @Param('competencyFrameworkId', ParseUUIDPipe) competencyFrameworkId: string,
    @Body() request: UpdateCompetencyFrameworkDto
  ): Promise<void> {
    await this.competencyFrameworkService.updateCompetencyFramework(competencyFrameworkId, request);
  }

  @Patch(':competencyFrameworkId/status')
  @Roles(UserRoleEnum.ADMIN)
  @ApiBody({ type: ChangeStatusCompetencyFrameworkDto })
  @ApiOperation({ summary: 'Publish a competency framework' })
  @ApiResponse({ status: 200, description: 'Competency framework published successfully' })
  async publishCompetencyFramework(
    @Param('competencyFrameworkId', ParseUUIDPipe) competencyFrameworkId: string,
    @Body() request: ChangeStatusCompetencyFrameworkDto
  ): Promise<void> {
    await this.competencyFrameworkService.changeStatusCompetencyFramework(competencyFrameworkId, request);
  }
}
