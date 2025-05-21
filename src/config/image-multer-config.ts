import { memoryStorage, Options as MulterOptions } from 'multer';
import { Request } from 'express';

const ACCEPTED_FILE = ['jpeg', 'jp2', 'webp', 'png'] as const;
const MAX_SIZE_FILE = 512 * 1024;

export const fileOption = (): MulterOptions => ({
  storage: memoryStorage(),
  fileFilter(req: Request, file, cb) {
    const ext = file.mimetype.split('/').pop();
    cb(null, ACCEPTED_FILE.includes(ext as (typeof ACCEPTED_FILE)[number]));
  },
  limits: { fileSize: MAX_SIZE_FILE },
});
