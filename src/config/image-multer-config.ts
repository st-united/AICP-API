import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';

const ACCEPTED_FILE: string[] = ['jpeg', 'jp2', 'jpeg', 'webp', 'png'];
const MAX_SIZE_FILE = 524288;

export const fileOption = () => {
  return process.env.STORAGE_LOCATED === 'LOCAL'
    ? {
        storage: diskStorage({
          filename: function (req, file, cb) {
            const fileExtension = file.mimetype.split('/').at(-1);
            cb(null, `${uuidv4()}.${fileExtension}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          const fileType = file.mimetype.split('/').at(-1);
          if (ACCEPTED_FILE.includes(fileType)) {
            return cb(null, true);
          }
          return cb(null, false);
        },
        limits: {
          fileSize: MAX_SIZE_FILE,
        },
      }
    : {};
};
