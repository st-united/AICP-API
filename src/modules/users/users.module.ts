import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersService } from '@UsersModule/users.service';
import { UsersController } from '@UsersModule/users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '@app/modules/email/email.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UsersController],
  providers: [UsersService, ConfigService, PrismaService, EmailService, JwtService],
  exports: [UsersService],
})
export class UsersModule {}
