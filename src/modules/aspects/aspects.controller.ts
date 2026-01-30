import { Controller, Get, UseGuards, Query, Body, Post, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '@app/modules/auth/guards/jwt-access-token.guard';
import { AspectsService } from '@app/modules/aspects/aspects.service';
import { Roles } from '@app/modules/auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { AspectListRequestDto } from './dto/request/aspect-list.request.dto';
import { AspectListItemDto } from './dto/response/aspect-list.response.dto';
import { AspectNameListDto } from './dto/response/aspect-dropdown.response.dto';
import { ResponsePaginate, ResponseItem } from '@app/common/dtos';
import { AspectStatisticsResponseDto } from './dto/response/aspect-statistics.response.dto';
import { AspectNamesRequestDto } from './dto/request/aspect-names.request.dto';
import { CreateAspectRequestDto } from './dto/request/create-aspect.request.dto';
import { AspectDetailResponseDto } from './dto/response/aspect-detail.response.dto';
import { UpdateAspectRequestDto } from './dto/request/update-aspect.request.dto';

@ApiTags('aspects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('aspects')
export class AspectsController {
  constructor(private readonly aspectsService: AspectsService) {}

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async list(@Query() query: AspectListRequestDto): Promise<ResponsePaginate<AspectListItemDto>> {
    return this.aspectsService.list(query);
  }

  @Get('statistics')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async getStatistics(): Promise<ResponseItem<AspectStatisticsResponseDto>> {
    return this.aspectsService.getStatistics();
  }

  @Get('by-pillar')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async getByPillar(@Query() query: AspectNamesRequestDto): Promise<ResponseItem<AspectNameListDto>> {
    return this.aspectsService.findAspectNamesByPillar(query);
  }
  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async create(@Body() body: CreateAspectRequestDto): Promise<ResponseItem<AspectListItemDto>> {
    return this.aspectsService.create(body);
  }

  @Get(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async getOne(@Param('id') id: string): Promise<ResponseItem<AspectDetailResponseDto>> {
    return this.aspectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateAspectRequestDto
  ): Promise<ResponseItem<AspectListItemDto>> {
    return this.aspectsService.update(id, body);
  }
}
