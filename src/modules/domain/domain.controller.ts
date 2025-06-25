import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { Public } from '../auth/guards/decorator/public.decorator';
import { ResponseItem } from '@app/common/dtos';
import { DomainService } from './domain.service';
import { DomainNamesDto } from './dto/domain-names.dto';

@ApiTags('domain')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('domain')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  @Get('names')
  @Public()
  @ApiOperation({ summary: 'Get all domains' })
  @ApiResponse({ status: 200, description: 'Get all domains successfully' })
  async findNames(): Promise<ResponseItem<DomainNamesDto>> {
    return await this.domainService.findNames();
  }
}
