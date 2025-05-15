import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { RequestCustom } from '../interfaces/request-custom';
import { concatSanitizedStrings, validateDeviceId } from '../utils/stringUtils';

@Injectable()
export class ClientInfoMiddleware implements NestMiddleware {
  use(req: RequestCustom, _res: Response, next: NextFunction) {
    const ip = req.ip;
    const deviceId = validateDeviceId(req.headers['device-id'] as string);
    req.clientInfo = concatSanitizedStrings(ip, deviceId, '_');
    next();
  }
}
