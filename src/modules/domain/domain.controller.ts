import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { Public } from '../auth/guards/decorator/public.decorator';
import { ResponseItem, ResponsePaginate } from '@app/common/dtos';
import { DomainService } from './domain.service';
import { DomainNamesDto } from './dto/domain-names.dto';
import { CreateDomainDto } from '@app/modules/domain/dto/request/create-domain.dto';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { Roles } from '@app/modules/auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { UpdateDomainDto } from './dto/request/update-domain.dto';
import { PaginatedSearchDomainDto } from './dto/request/paginated-search-domain.dto';
import { UpdateDomainStatusDto } from './dto/request/update-domain-status.dto';

@ApiTags('domain')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get()
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Search domains by params' })
  @ApiResponse({ status: 200, description: 'Search domains successfully' })
  async searchPaging(@Query() query: PaginatedSearchDomainDto): Promise<ResponsePaginate<DomainDto>> {
    return await this.domainService.searchPaging(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create domain' })
  @ApiBody({ type: CreateDomainDto })
  @Roles(UserRoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Create domain successfully' })
  async create(@Body() params: CreateDomainDto): Promise<ResponseItem<DomainDto>> {
    return await this.domainService.create(params);
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN)
  @ApiOperation({ summary: 'Get domain by id' })
  @ApiResponse({ status: 200, description: 'Get domain successfully' })
  async findOne(@Param('id') id: string): Promise<ResponseItem<DomainDto>> {
    return await this.domainService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update domain' })
  @ApiBody({ type: UpdateDomainDto })
  @Roles(UserRoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Update domain successfully' })
  async update(@Param('id') id: string, @Body() params: UpdateDomainDto): Promise<ResponseItem<DomainDto>> {
    return await this.domainService.update(id, params);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate/Deactivate domain' })
  @ApiBody({ type: UpdateDomainStatusDto })
  @Roles(UserRoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Update domain status successfully' })
  async updateStatus(@Param('id') id: string, @Body() params: UpdateDomainStatusDto): Promise<ResponseItem<DomainDto>> {
    return await this.domainService.updateStatus(id, params);
  }

  @Get('names')
  @Public()
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({ status: 200, description: 'Get all domains successfully' })
  async findNames(): Promise<ResponseItem<DomainNamesDto>> {
    return await this.domainService.findNames();
  }
}
