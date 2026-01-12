import { Module } from '@nestjs/common';
import { AssessmentMethodsService } from './assessment-methods.service';
import { AssessmentMethodsController } from './assessment-methods.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AssessmentMethodsService],
  controllers: [AssessmentMethodsController],
  exports: [AssessmentMethodsService],
})
export class AssessmentMethodsModule {}
