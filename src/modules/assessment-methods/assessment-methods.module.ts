import { Module } from '@nestjs/common';
import { AssessmentMethodsService } from './assessment-methods.service';
import { AssessmentMethodsController } from './assessment-methods.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
  imports: [PrismaModule, PermissionsModule],
  providers: [AssessmentMethodsService],
  controllers: [AssessmentMethodsController],
  exports: [AssessmentMethodsService],
})
export class AssessmentMethodsModule {}
