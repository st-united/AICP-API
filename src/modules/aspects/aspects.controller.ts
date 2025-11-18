import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { AspectsService } from './aspects.service';
import { Roles } from '../auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { AspectDto } from './dto/response/aspect.dto';

@ApiTags('aspects')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('aspects')
export class AspectsController {
  constructor(private readonly aspectsService: AspectsService) {}

  @Get()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  async findAll(): Promise<AspectDto[]> {
    return this.aspectsService.findAll();
  }
}
