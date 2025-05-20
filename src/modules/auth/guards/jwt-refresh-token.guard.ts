import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { TokenService } from '../services/token.service';
@Injectable()
export class JwtRefreshTokenGuard extends AuthGuard('jwt-refresh-token') {
  constructor(private readonly tokenService: TokenService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const { headers } = context.switchToHttp().getRequest();
    const { authorization } = headers;

    if (!authorization) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    const token = authorization.replace('Bearer ', '');

    try {
      this.tokenService.verifyRefreshToken(token);
    } catch (error) {
      throw new UnauthorizedException('TOKEN_EXPIRED');
    }

    return true;
  }
}
