import { Controller, Get, Post, Query } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { GetUniversitiesDto } from '@app/modules/universities/dto/request/get-universities.dto';
import { PaginatedResponseDto } from '@app/modules/universities/dto/response/paginated-response.dto';

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
  async getAllUniversities(@Query() query: GetUniversitiesDto): Promise<PaginatedResponseDto> {
    return this.universitiesService.getAllUniversities(query);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Sync universities data from an external source' })
  @ApiResponse({ status: 201, description: 'Universities data synced successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async syncUniversities() {
    return this.universitiesService.syncUniversities();
  }
}
