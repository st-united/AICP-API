import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CoursesService } from '@app/modules/courses/courses.service';
import { ResponseItem } from '@app/common/dtos';
import { CourseResponseDto } from '@app/modules/courses/dto/response/course-response.dto';
import { RegisterCourseDto } from '@app/modules/courses/dto/request/register-course.dto';
import { JwtAccessTokenGuard } from '@app/modules/auth/guards/jwt-access-token.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '@app/modules/auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { CreateCourseDto } from '@app/modules/courses/dto/request/create-course.dto';
import { VALIDATION_THUMB_IMAGE } from '@app/validations';
import { SFIALevel } from '@prisma/client';
import { RolesGuard } from '@app/modules/auth/guards/roles.guard';
import { PaginatedSearchCourseDto } from './dto/request/paginated-search-course.dto';

@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiBody({ type: CreateCourseDto })
  @UseInterceptors(VALIDATION_THUMB_IMAGE)
  @ApiConsumes('multipart/form-data')
  async create(@UploadedFile() thumbnailImage: Express.Multer.File, @Body() body: CreateCourseDto) {
    return this.coursesService.createCourse({
      ...body,
      thumbnailImage,
    });
  }

  @Get()
  async findAll(@Req() req: any, @Query('excludeId') excludeId?: string): Promise<ResponseItem<CourseResponseDto[]>> {
    const userId = req.user.userId;
    return this.coursesService.findAll(userId, excludeId);
  }

  @Get('paging')
  async searchCoursesPaining(@Query() request: PaginatedSearchCourseDto) {
    return this.coursesService.searchCoursesPaining(request);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<ResponseItem<CourseResponseDto>> {
    const userId = req.user.userId;
    return this.coursesService.findOne(id, userId);
  }

  @Post(':id/register')
  registerCourse(@Param('id', ParseUUIDPipe) courseId: string, @Req() req: any) {
    const userId = req.user.userId;

    const dto: RegisterCourseDto = {
      userId,
      courseId,
    };

    return this.coursesService.registerCourse(dto);
  }
}
