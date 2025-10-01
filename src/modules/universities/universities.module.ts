import { Module } from '@nestjs/common';
import { UniversitiesService } from '@app/modules/universities/universities.service';
import { UniversitiesController } from '@app/modules/universities/universities.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversityModule {}
