import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtPayload } from '@Constant/types';
import { UserDecodedPayload } from '@app/common/dtos';
@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh-token') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRETKEY'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserDecodedPayload> {
    return { userId: payload.sub, email: payload.email };
  }
}
