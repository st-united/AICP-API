export class ZaloErrorTranslator {
  private static readonly errorTranslations: { [key: string]: string } = {
    'Zalo account not existed': 'Tài khoản Zalo không tồn tại',
    'Zalo account not exist': 'Tài khoản Zalo không tồn tại',
    'Phone number not found': 'Số điện thoại không tìm thấy',
    'Invalid phone number': 'Số điện thoại không hợp lệ',
    'Phone number is not registered': 'Số điện thoại chưa đăng ký Zalo',
    'Template not found': 'Mẫu tin nhắn không tìm thấy',
    'Template is not active': 'Mẫu tin nhắn không hoạt động',
    'Access token expired': 'Token truy cập đã hết hạn',
    'Invalid access token': 'Token truy cập không hợp lệ',
    'Rate limit exceeded': 'Vượt quá giới hạn gửi tin nhắn',
    'Too many requests': 'Quá nhiều yêu cầu',
    'Service temporarily unavailable': 'Dịch vụ tạm thời không khả dụng',
    'Internal server error': 'Lỗi máy chủ nội bộ',
    send_otp_failed: 'Gửi OTP thất bại',
    access_token_expired: 'Token truy cập đã hết hạn',
    'Network error': 'Lỗi kết nối mạng',
    Timeout: 'Hết thời gian chờ',
    'Connection refused': 'Kết nối bị từ chối',
    'Request failed': 'Yêu cầu thất bại',
  };

  static translate(errorMessage: string): string {
    if (!errorMessage) return 'Lỗi không xác định';

    // Exact match
    const exactMatch = this.errorTranslations[errorMessage];
    if (exactMatch) return exactMatch;

    // Case-insensitive match
    const lowerCaseMessage = errorMessage.toLowerCase();
    const caseInsensitiveMatch = Object.entries(this.errorTranslations).find(
      ([key]) => key.toLowerCase() === lowerCaseMessage
    );
    if (caseInsensitiveMatch) return caseInsensitiveMatch[1];

    // Pattern matching
    const patterns = [
      { pattern: 'zalo account', translation: 'Tài khoản Zalo không hợp lệ' },
      { pattern: 'phone', translation: 'Số điện thoại không hợp lệ' },
      { pattern: 'token', translation: 'Token không hợp lệ hoặc đã hết hạn' },
      { pattern: 'rate limit', translation: 'Vượt quá giới hạn gửi tin nhắn' },
      { pattern: 'too many', translation: 'Vượt quá giới hạn gửi tin nhắn' },
      { pattern: 'network', translation: 'Lỗi kết nối mạng' },
      { pattern: 'connection', translation: 'Lỗi kết nối mạng' },
    ];

    const patternMatch = patterns.find((p) => lowerCaseMessage.includes(p.pattern));
    if (patternMatch) return patternMatch.translation;

    return `Lỗi Zalo: ${errorMessage}`;
  }

  static isAccessTokenError(errorMessage: string): boolean {
    const tokenErrors = ['access_token_expired', 'Invalid access token', 'Access token expired'];
    return tokenErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
  }

  static isPhoneNumberError(errorMessage: string): boolean {
    const phoneErrors = ['phone', 'zalo account'];
    return phoneErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
  }
}
