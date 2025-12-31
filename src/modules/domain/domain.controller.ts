import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { Public } from '../auth/guards/decorator/public.decorator';
import { ResponseItem } from '@app/common/dtos';
import { DomainService } from './domain.service';
import { DomainNamesDto } from './dto/domain-names.dto';
import { CreateDomainDto } from '@app/modules/domain/dto/request/create-domain.dto';
import { DomainDto } from '@app/modules/domain/dto/response/domain.dto';
import { Roles } from '@app/modules/auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';

@ApiTags('domain')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Post()
  @ApiOperation({ summary: 'Create domain' })
  @ApiBody({ type: CreateDomainDto })
  @Roles(UserRoleEnum.ADMIN)
  @ApiResponse({ status: 200, description: 'Create domain successfully' })
  async create(@Body() params: CreateDomainDto): Promise<ResponseItem<DomainDto>> {
    return await this.domainService.create(params);
  }

  @Get('names')
  @Public()
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({ status: 200, description: 'Get all domains successfully' })
  async findNames(): Promise<ResponseItem<DomainNamesDto>> {
    return await this.domainService.findNames();
  }
}
