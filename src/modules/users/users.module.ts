import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersService } from '@UsersModule/users.service';
import { UsersController } from '@UsersModule/users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '@app/modules/email/email.service';
import { TokenService } from '@app/modules/auth/services/token.service';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRETKEY'),
        signOptions: { expiresIn: `${configService.get<number>('JWT_ACCESS_EXPIRES')}` },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, ConfigService, PrismaService, EmailService, TokenService],
  exports: [UsersService],
})
export class UsersModule {}
