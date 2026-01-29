import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { MigrationService } from './migration.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from '../auth/guards/decorator/roles.decorator';
import { UserRoleEnum } from '@Constant/enums';

@ApiTags('System Migration')
@Controller('system/migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('level-system')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Migrate to Level System',
    description: 'Migrates existing SFIALevel enum data to new LevelScale and Level tables',
  })
  @ApiResponse({ status: 200, description: 'Migration completed successfully' })
  @ApiResponse({ status: 500, description: 'Migration failed' })
  async migrateToLevelSystem() {
    return this.migrationService.migrateToLevelSystem();
  }

  @Get('level-system/status')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Check Migration Status',
    description: 'Check if Level System migration has been completed and view statistics',
  })
  @ApiResponse({ status: 200, description: 'Migration status retrieved' })
  async checkMigrationStatus() {
    return this.migrationService.checkMigrationStatus();
  }

  @Post('intermediate-tables')
  @Roles(UserRoleEnum.ADMIN, UserRoleEnum.SUPER_ADMIN)
  @ApiOperation({
    summary: 'Migrate Framework to Intermediate Tables',
    description: 'Migrates existing Framework, Pillar, Aspect, Level data to new intermediate tables structure',
  })
  @ApiResponse({ status: 200, description: 'Framework intermediate tables migration completed successfully' })
  @ApiResponse({ status: 500, description: 'Migration failed' })
  async migrateToIntermediateTables() {
    return this.migrationService.migrateToIntermediateTables();
  }
}
