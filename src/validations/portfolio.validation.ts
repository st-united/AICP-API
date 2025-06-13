import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Express } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
export const FILE_LIMITS = {
  fileSize: 5 * 1024 * 1024,
  files: 40,
  maxCount: 20,
};

export const validatePortfolioFiles = (certifications?: Express.Multer.File[], experiences?: Express.Multer.File[]) => {
  if (certifications?.length > FILE_LIMITS.maxCount) {
    throw new BadRequestException(`Số lượng file certification không được vượt quá ${FILE_LIMITS.maxCount}`);
  }
  if (experiences?.length > FILE_LIMITS.maxCount) {
    throw new BadRequestException(`Số lượng file experience không được vượt quá ${FILE_LIMITS.maxCount}`);
  }

  const totalFiles = [...(certifications || []), ...(experiences || [])];
  const totalSize = totalFiles.reduce((acc, file) => acc + file.size, 0);

  if (totalSize > FILE_LIMITS.fileSize * FILE_LIMITS.files) {
    throw new PayloadTooLargeException('Tổng kích thước file vượt quá giới hạn cho phép');
  }

  const invalidFiles = totalFiles.filter((file) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    return !ALLOWED_EXTENSIONS.includes(ext);
  });

  if (invalidFiles.length > 0) {
    throw new UnsupportedMediaTypeException(
      `Các file sau có định dạng không được hỗ trợ: ${invalidFiles.map((f) => f.originalname).join(', ')}`
    );
  }
};

export const validateFileExtension = (file: Express.Multer.File) => {
  const fileExt = file.originalname.split('.').pop()?.toLowerCase();
  if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
    throw new BadRequestException(
      `File extension ${fileExt} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }
  return true;
};

export const validateFileSize = (file: Express.Multer.File) => {
  if (file.size > FILE_LIMITS.fileSize) {
    throw new BadRequestException(`File size exceeds limit of ${FILE_LIMITS.fileSize / 1024 / 1024}MB`);
  }
  return true;
};

export const validateFileCount = (files: Express.Multer.File[]) => {
  if (files.length > FILE_LIMITS.files) {
    throw new BadRequestException(`Maximum ${FILE_LIMITS.files} files allowed`);
  }
  return true;
};

export const PORTFOLIO_FILE_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'certifications', maxCount: FILE_LIMITS.maxCount },
    { name: 'experiences', maxCount: FILE_LIMITS.maxCount },
  ],
  {
    limits: {
      fileSize: FILE_LIMITS.fileSize,
      files: FILE_LIMITS.files,
    },
    fileFilter: (req, file: Express.Multer.File, callback) => {
      try {
        validateFileExtension(file);
        callback(null, true);
      } catch (error) {
        callback(error, false);
      }
    },
  }
);
