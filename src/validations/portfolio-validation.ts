import { BadRequestException, PayloadTooLargeException, UnsupportedMediaTypeException } from '@nestjs/common';
import { Express } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

// File type constants
export const ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'] as const;
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/png',
  'image/jpeg',
  'image/jpg',
] as const;

export const FILE_LIMITS = {
  fileSize: 5 * 1024 * 1024,
  totalSize: 200 * 1024 * 1024,
  maxCountPerCategory: 20,
  maxTotalFiles: 40,
} as const;

const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

const isValidFileExtension = (filename: string): boolean => {
  const ext = getFileExtension(filename);
  return ALLOWED_EXTENSIONS.includes(ext as any);
};

const isValidFileSize = (size: number): boolean => {
  return size > 0 && size <= FILE_LIMITS.fileSize;
};

const calculateTotalSize = (files: Express.Multer.File[]): number => {
  return files.reduce((acc, file) => acc + file.size, 0);
};

export const validatePortfolioFiles = (
  certificateFiles?: Express.Multer.File[],
  experienceFiles?: Express.Multer.File[]
): void => {
  if (!certificateFiles?.length && !experienceFiles?.length) {
    return;
  }

  const certFiles = certificateFiles || [];
  const expFiles = experienceFiles || [];

  if (certFiles.length > FILE_LIMITS.maxCountPerCategory) {
    throw new BadRequestException(`Số lượng file certification không được vượt quá ${FILE_LIMITS.maxCountPerCategory}`);
  }

  if (expFiles.length > FILE_LIMITS.maxTotalFiles) {
    throw new BadRequestException(`Số lượng file experience không được vượt quá ${FILE_LIMITS.maxCountPerCategory}`);
  }

  const totalFileCount = certFiles.length + expFiles.length;
  if (totalFileCount > FILE_LIMITS.maxTotalFiles) {
    throw new BadRequestException(`Tổng số file không được vượt quá ${FILE_LIMITS.maxTotalFiles}`);
  }

  const totalSize = calculateTotalSize([...certFiles, ...expFiles]);
  if (totalSize > FILE_LIMITS.totalSize) {
    throw new PayloadTooLargeException(
      `Tổng kích thước file vượt quá giới hạn ${FILE_LIMITS.totalSize / 1024 / 1024}MB`
    );
  }

  const invalidFiles: string[] = [];
  const oversizedFiles: string[] = [];

  for (const file of [...certFiles, ...expFiles]) {
    if (!file || typeof file.size !== 'number') {
      throw new BadRequestException(`File object không hợp lệ: ${file?.originalname || 'unknown'}`);
    }

    if (!isValidFileExtension(file.originalname)) {
      invalidFiles.push(file.originalname);
    }
    if (!isValidFileSize(file.size)) {
      oversizedFiles.push(file.originalname);
    }
  }

  if (invalidFiles.length > 0) {
    throw new UnsupportedMediaTypeException(`Các file sau có định dạng không được hỗ trợ: ${invalidFiles.join(', ')}`);
  }

  if (oversizedFiles.length > 0) {
    throw new PayloadTooLargeException(
      `Các file sau vượt quá kích thước ${FILE_LIMITS.fileSize / 1024 / 1024}MB: ${oversizedFiles.join(', ')}`
    );
  }
};

export const validateFileExtension = (file: Express.Multer.File): boolean => {
  if (!isValidFileExtension(file.originalname)) {
    throw new BadRequestException(
      `Định dạng file ${getFileExtension(file.originalname)} không được hỗ trợ. Định dạng được phép: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }
  return true;
};

export const validateFileCount = (files: Express.Multer.File[]): boolean => {
  if (files.length > FILE_LIMITS.maxTotalFiles) {
    throw new BadRequestException(`Tối đa ${FILE_LIMITS.maxTotalFiles} file được phép`);
  }
  return true;
};

export const PORTFOLIO_FILE_INTERCEPTOR = FileFieldsInterceptor(
  [
    { name: 'certificateFiles', maxCount: FILE_LIMITS.maxCountPerCategory },
    { name: 'experienceFiles', maxCount: FILE_LIMITS.maxCountPerCategory },
  ],
  {
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

export const validatePortfolioRequest = (
  certificateFiles?: Express.Multer.File[],
  experienceFiles?: Express.Multer.File[],
  deletedCertifications?: string[],
  deletedExperiences?: string[],
  linkedInUrl?: string,
  githubUrl?: string,
  portfolioUrl?: string,
  developmentFocusAnswer?: string,
  isStudent?: string
): void => {
  const hasFiles = (certificateFiles?.length || 0) + (experienceFiles?.length || 0) > 0;
  const hasDeletions = (deletedCertifications?.length || 0) + (deletedExperiences?.length || 0) > 0;
  const hasUrlUpdates = linkedInUrl !== undefined || githubUrl !== undefined || portfolioUrl !== undefined;
  const hasTextUpdates = developmentFocusAnswer !== undefined;

  if (!hasFiles && !hasDeletions && !hasUrlUpdates && !hasTextUpdates && isStudent === undefined) {
    throw new BadRequestException(
      'Yêu cầu phải chứa ít nhất một thay đổi: file mới, xóa file, cập nhật URL, hoặc cập nhật text'
    );
  }
};

export const validateDeletedFiles = (
  deletedCertifications: string[],
  deletedExperiences: string[],
  currentCertFiles: string[],
  currentExpFiles: string[]
): void => {
  const invalidCertDeletions = deletedCertifications.filter((file) => !currentCertFiles.includes(file));

  const invalidExpDeletions = deletedExperiences.filter((file) => !currentExpFiles.includes(file));

  if (invalidCertDeletions.length > 0) {
    throw new BadRequestException(
      `Các file certification sau không tồn tại trong portfolio: ${invalidCertDeletions.join(', ')}`
    );
  }

  if (invalidExpDeletions.length > 0) {
    throw new BadRequestException(
      `Các file experience sau không tồn tại trong portfolio: ${invalidExpDeletions.join(', ')}`
    );
  }
};
