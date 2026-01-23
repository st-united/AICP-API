import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UniversitiesService } from '@app/modules/universities/universities.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PageOptionsDto, ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { University } from '@app/modules/universities/dto/university.dto';
import { JwtAccessTokenGuard } from '@app/modules/auth/guards/jwt-access-token.guard';
import { Roles } from '@app/modules/auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { CreateUniversityDto, UpdateUniversityDto } from '@app/modules/universities/dto/request';
import { SimpleResponse } from '@app/common/dtos/base-response-item.dto';

@Controller('universities')
export class UniversitiesController {
  constructor(private readonly universitiesService: UniversitiesService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get university by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 404, description: 'Trường đại học không tồn tại' })
  async getUniversity(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string): Promise<ResponseItem<University>> {
    return this.universitiesService.getUniversity(id);
  }

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
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAccessTokenGuard, RolesGuard)
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Synchronize universities from external API (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Synchronization result',
    type: SimpleResponse,
    example: {
      data: 200,
      message: 'Đã đồng bộ thành công: Insert 200 trường đại học mới.',
    },
  })
  @ApiResponse({ status: 403, description: 'Forbidden: Admin role required' })
  @ApiResponse({ status: 401, description: 'Unauthorized: Invalid or missing token' })
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
    type: CreateUniversityDto,
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
  async create(@Body() newUniversity: CreateUniversityDto): Promise<University> {
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
    type: CreateUniversityDto,
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
  async update(@Param('id') id: string, @Body() updateUniversityDto: UpdateUniversityDto): Promise<University> {
    return this.universitiesService.updateUniversity(id, updateUniversityDto);
  }
}
