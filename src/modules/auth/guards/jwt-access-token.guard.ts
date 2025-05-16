// jwt-access-token.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './decorator/public.decorator';
import { RedisService } from '@app/modules/redis/redis.service';
import { RequestCustom } from '@app/common/interfaces/request-custom';

@Injectable()
export class JwtAccessTokenGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly redisService: RedisService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Run default JWT guard (check token)
    const isJwtTokenValid = await super.canActivate(context);
    if (!isJwtTokenValid) return false;

    // Get request and authenticated user
    const req = context.switchToHttp().getRequest<RequestCustom>();
    const user = req.user;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    const allowed = await this.redisService.isSessionExist(user.userId, ip, userAgent);
    if (!allowed) {
      throw new UnauthorizedException('Tài khoản của bạn đang được đăng nhập ở nơi khác');
    }
    return true;
  }
}
