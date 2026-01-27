import { Module } from '@nestjs/common';
import { AspectsService } from './aspects.service';
import { AspectsController } from './aspects.controller';
import { PermissionsModule } from '../permissions/permissions.module';

import { AspectsQueries } from './aspects.queries';

@Module({
  imports: [PermissionsModule],
  controllers: [AspectsController],
  providers: [AspectsService, AspectsQueries],
  exports: [AspectsService, AspectsQueries],
})
export class AspectsModule {}
