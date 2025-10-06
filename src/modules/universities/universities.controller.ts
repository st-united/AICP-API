import { Controller, Get, Post, Query } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { PageOptionsDto, ResponsePaginate } from '@app/common/dtos';
import { University } from './dto/university.dto';

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
}
