import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtAccessTokenStrategy } from './strategies/jwt-access-token.strategy';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh-token.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { UsersModule } from '@UsersModule/users.module';
import { ActivationTokenStrategy } from './strategies/activation-token.strategy';
import { EmailModule } from '../email/email.module';
import { RedisModule } from '../redis/redis.module';
import { TokenService } from './services/token.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { ScheduledActivationService } from './scheduled-activation.service';

@Module({
  imports: [
    FirebaseModule,
    PassportModule,
    UsersModule,
    EmailModule,
    RedisModule,
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRETKEY'),
        signOptions: { expiresIn: `${configService.get<number>('JWT_ACCESS_EXPIRES')}` },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtAccessTokenStrategy,
    JwtRefreshTokenStrategy,
    ActivationTokenStrategy,
    ConfigService,
    PrismaService,
    TokenService,
    ScheduledActivationService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
