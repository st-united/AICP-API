import { diskStorage, Options as MulterOptions } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

const ACCEPTED_FILE = ['jpeg', 'jp2', 'webp', 'png'] as const;
const MAX_SIZE_FILE = 512 * 1024;

export const fileOption = (): MulterOptions => ({
  storage: diskStorage({
    filename(req: Request, file, cb) {
      const ext = file.mimetype.split('/').pop();
      cb(null, `${uuidv4()}.${ext}`);
    },
  }),
  fileFilter(req: Request, file, cb) {
    const ext = file.mimetype.split('/').pop();
    cb(null, ACCEPTED_FILE.includes(ext as (typeof ACCEPTED_FILE)[number]));
  },
  limits: { fileSize: MAX_SIZE_FILE },
});
