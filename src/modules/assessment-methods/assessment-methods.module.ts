import { Module } from '@nestjs/common';
import { AssessmentMethodsService } from './assessment-methods.service';
import { AssessmentMethodsController } from './assessment-methods.controller';
import { PrismaModule } from '../prisma/prisma.module';

import { AssessmentMethodsQueries } from './assessment-methods.queries';

@Module({
  imports: [PrismaModule],
  providers: [AssessmentMethodsService, AssessmentMethodsQueries],
  controllers: [AssessmentMethodsController],
  exports: [AssessmentMethodsService],
})
export class AssessmentMethodsModule {}
