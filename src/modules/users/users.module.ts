import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '@UsersModule/users.service';
import { UsersController } from '@UsersModule/users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '@app/modules/email/email.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService, PrismaService, EmailService],
  exports: [UsersService],
})
export class UsersModule {}
