import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [CoursesController],
  providers: [CoursesService, ConfigService],
})
export class CoursesModule {}
