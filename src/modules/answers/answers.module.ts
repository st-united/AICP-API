import { Module } from '@nestjs/common';
import { AnswersService } from './answers.service';
import { AnswersController } from './answers.controller';
import { ConfigModule } from '@nestjs/config';
import { AnswersScheduler } from './answers.scheduler';

@Module({
  imports: [ConfigModule],
  controllers: [AnswersController],
  providers: [AnswersService, AnswersScheduler],
})
export class AnswersModule {}
