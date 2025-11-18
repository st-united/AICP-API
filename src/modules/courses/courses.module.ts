import { Module } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { ConfigService } from '@nestjs/config';
import { GoogleCloudModule } from '../google-cloud/google-cloud.module';
import { PermissionsModule } from '@PermissionsModule/permissions.module';

@Module({
  imports: [GoogleCloudModule, PermissionsModule],
  controllers: [CoursesController],
  providers: [CoursesService, ConfigService],
})
export class CoursesModule {}
