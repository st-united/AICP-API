import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestCustom } from '../interfaces/request-custom';
import { concatSanitizedStrings } from '../utils/stringUtils';

@Injectable()
export class ClientInfoMiddleware implements NestMiddleware {
  use(req: RequestCustom, _res: Response, next: NextFunction) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    req.clientInfo = concatSanitizedStrings(ip, userAgent, '_');
    next();
  }
}
