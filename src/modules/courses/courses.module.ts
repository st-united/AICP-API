import { Module } from '@nestjs/common';
import { CoursesService } from '@app/modules/courses/courses.service';
import { CoursesController } from '@app/modules/courses/courses.controller';
import { ConfigService } from '@nestjs/config';
import { GoogleCloudModule } from '@app/modules/google-cloud/google-cloud.module';
import { PermissionsModule } from '@PermissionsModule/permissions.module';

@Module({
  imports: [GoogleCloudModule, PermissionsModule],
  controllers: [CoursesController],
  providers: [CoursesService, ConfigService],
})
export class CoursesModule {}
