import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class ActivationTokenStrategy extends PassportStrategy(Strategy, 'activation') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACTIVATE_SECRETKEY'),
    });
  }

  async validate(payload: any) {
    if (!payload?.userId) {
      throw new UnauthorizedException('Invalid activation token');
    }
    return payload;
  }
}
