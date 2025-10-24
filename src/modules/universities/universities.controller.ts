import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PageOptionsDto, ResponsePaginate } from '@app/common/dtos';
import { University } from './dto/university.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { Roles } from '../auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all universities with optional search and pagination' })
  @ApiQuery({
    name: 'search',
    type: String,
    required: false,
    description: 'Search term to filter universities by name or other criteria',
  })
  @ApiQuery({
    name: 'skip',
    type: String,
    required: false,
    description: 'Number of records to skip for pagination (default: 0)',
  })
  @ApiQuery({
    name: 'take',
    type: String,
    required: false,
    description: 'Number of records to take per page (default: 100)',
  })
  @ApiResponse({ status: 200, description: 'List of universities retrieved successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @Get()
  async getAllUniversities(@Query() query: PageOptionsDto): Promise<ResponsePaginate<University>> {
    return this.universitiesService.getAllUniversities(query);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync universities data from an external source' })
  @ApiResponse({ status: 201, description: 'Universities data synced successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncUniversities() {
    return this.universitiesService.syncUniversities();
  }

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new university (Admin or Super Admin only)' })
  @ApiBody({
    type: University,
    description: 'University creation data (id is ignored)',
    examples: {
      create: {
        value: { name: 'Harvard University', code: 'HARVARD' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'University created successfully', type: University })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin or Super Admin role required' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing token' })
  @ApiResponse({ status: 409, description: 'Conflict: University name or code already exists' })
  async create(@Body() newUniversity: University): Promise<University> {
    return this.universitiesService.createUniversity(newUniversity);
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing university (Admin or Super Admin only)' })
  @ApiParam({ name: 'id', description: 'University ID', type: String })
  @ApiBody({
    type: University,
    description: 'University update data (partial fields allowed)',
    examples: {
      update: {
        value: { name: 'Updated University', code: 'UPDATED' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'University updated successfully', type: University })
  @ApiResponse({ status: 404, description: 'University not found' })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing token' })
  @ApiResponse({ status: 409, description: 'Conflict: University name or code already exists' })
  async update(@Param('id') id: string, @Body() updateUniversityDto: University): Promise<University> {
    return this.universitiesService.updateUniversity(id, updateUniversityDto);
  }
}
