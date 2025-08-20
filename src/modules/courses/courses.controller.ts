import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ResponseItem } from '@app/common/dtos';
import { CourseResponseDto } from './dto/response/course-response.dto';
import { RegisterCourseDto } from './dto/request/register-course.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessTokenGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

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
