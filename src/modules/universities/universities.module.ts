import { Module } from '@nestjs/common';
import { UniversitiesService } from './universities.service';
import { UniversitiesController } from './universities.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [UniversitiesController],
  providers: [UniversitiesService],
  exports: [UniversitiesService],
})
export class UniversityModule {}
