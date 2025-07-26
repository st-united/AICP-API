import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { ResponseItem } from '@app/common/dtos';
import { CourseResponseDto } from './dto/response/course-response.dto';
import { RegisterCourseDto } from './dto/request/register-course.dto';
import { JwtAccessTokenGuard } from '../auth/guards/jwt-access-token.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessTokenGuard)
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
  async findAll(): Promise<ResponseItem<CourseResponseDto[]>> {
    return this.coursesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResponseItem<CourseResponseDto>> {
    return this.coursesService.findOne(id);
  }
}
