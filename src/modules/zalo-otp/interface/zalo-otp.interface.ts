export interface OtpData {
  phoneNumber: string;
  zaloUserId: string;
  otpCode: string;
  createdAt: number;
  expiresAt: number;
}

export interface PendingPhone {
  phoneNumber: string;
  submittedAt: number;
}
