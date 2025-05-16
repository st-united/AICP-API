import { Request } from 'express';
import { UserDecodedPayload } from '../dtos';

export interface RequestCustom extends Request {
  clientInfo?: string;
  user?: UserDecodedPayload;
}
