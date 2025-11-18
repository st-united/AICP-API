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
import { CoursesService } from './courses.service';
import { ResponseItem } from '@app/common/dtos';
import { CourseResponseDto } from './dto/response/course-response.dto';
import { RegisterCourseDto } from './dto/request/register-course.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Roles } from '../auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';
import { CreateCourseDto } from './dto/request/create-course.dto';
import { VALIDATION_THUMB_IMAGE } from '@app/validations';
import { SFIALevel } from '@prisma/client';
import { RolesGuard } from '../auth/guards/roles.guard';
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

  @Post(':id/register')
  registerCourse(@Param('id', ParseUUIDPipe) courseId: string, @Req() req: any) {
    const userId = req.user.userId;

    const dto: RegisterCourseDto = {
      userId,
      courseId,
    };

    return this.coursesService.registerCourse(dto);
  }

  @Get()
  async findAll(@Req() req: any, @Query('excludeId') excludeId?: string): Promise<ResponseItem<CourseResponseDto[]>> {
    const userId = req.user.userId;
    return this.coursesService.findAll(userId, excludeId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any): Promise<ResponseItem<CourseResponseDto>> {
    const userId = req.user.userId;
    return this.coursesService.findOne(id, userId);
  }
}
