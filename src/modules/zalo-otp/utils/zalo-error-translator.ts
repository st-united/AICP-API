export class ZaloErrorTranslator {
  private static readonly errorCodeTranslations: { [key: number]: string } = {
    0: 'Request thành công',
    [-32]: 'Vượt quá giới hạn tốc độ request/phút',
    [-100]: 'attachment_id đã hết hạn',
    [-200]: 'Gửi tin nhắn thất bại',
    [-201]: 'Tham số không hợp lệ',
    [-204]: 'Official Account đã bị xóa',
    [-205]: 'Official Account không tồn tại',
    [-209]: 'API này không được hỗ trợ do ứng dụng chưa được kích hoạt',
    [-210]: 'Tham số vượt quá giới hạn cho phép',
    [-211]: 'Vượt quá quota sử dụng cho phép của tính năng',
    [-212]: 'Official Account chưa đăng ký API này',
    [-213]: 'Người dùng chưa quan tâm Official Account',
    [-214]: 'Bài viết đang được xử lý',
    [-216]: 'Access token không hợp lệ',
    [-217]: 'Người dùng đã chặn tin mời quan tâm',
    [-218]: 'Đã quá giới hạn gửi đến người dùng này',
    [-219]: 'Ứng dụng đã bị gỡ bỏ hoặc vô hiệu hóa',
    [-220]: 'Access token đã hết hạn hoặc không còn khả dụng',
    [-221]: 'Tài khoản Official Account chưa xác thực',
    [-223]: 'OA chưa cấp quyền để ứng dụng sử dụng API',
    [-224]: 'Official Account chưa mua gói dịch vụ để sử dụng tính năng này',
    [-227]: 'Tài khoản người dùng đã bị khóa hoặc không online hơn 45 ngày',
    [-230]: 'Người dùng không tương tác với OA trong 7 ngày qua',
    [-232]: 'Người dùng chưa phát sinh tương tác hoặc tương tác cuối đã quá hạn',
    [-233]: 'Loại tin nhắn không được hỗ trợ hoặc không khả dụng',
    [-234]: 'Loại tin nhắn này không được phép gửi vào buổi tối (22:00 - 06:00)',
    [-235]: 'API này không được hỗ trợ cho phân loại OA',
    [-237]: 'Nhóm chat GMF đã hết hạn',
    [-238]: 'asset_id đã được sử dụng hoặc không còn khả dụng',
    [-240]: 'API gửi tin nhắn V2 đã không còn hoạt động, vui lòng chuyển qua API gửi tin nhắn V3',
    [-241]: 'asset_id miễn phí đã được sử dụng',
    [-242]: 'appsecret_proof cung cấp trong tham số API không hợp lệ',
    [-244]: 'Người dùng đã hạn chế nhận loại tin nhắn này từ OA của bạn',
    [-248]: 'Vi phạm tiêu chuẩn nền tảng',
    [-320]: 'Ứng dụng cần kết nối với Zalo Cloud Account để sử dụng tính năng trả phí',
    [-321]: 'Zalo Cloud Account liên kết với App đã hết tiền hoặc không thể thực hiện trả phí',
    [-403]: 'Không thể tương tác với nhóm chat vì nhóm này không được sở hữu bởi OA',
    [-1340]: 'Không tìm thấy Form',
    [-1341]: 'OA không có quyền truy cập form này',
  };

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

  static translateError(errorMessage?: string, errorCode?: number): string {
    if (typeof errorCode === 'number' && this.errorCodeTranslations[errorCode]) {
      return this.errorCodeTranslations[errorCode];
    }
    if (!errorMessage) return 'Lỗi không xác định';
    return this.translate(errorMessage);
  }

  static isAccessTokenError(errorMessage: string, errorCode?: number): boolean {
    const tokenErrorCodes = [-216, -220];
    if (typeof errorCode === 'number' && tokenErrorCodes.includes(errorCode)) {
      return true;
    }
    const tokenErrors = ['access_token_expired', 'Invalid access token', 'Access token expired'];
    return tokenErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
  }

  static isPhoneNumberError(errorMessage: string): boolean {
    const phoneErrors = ['phone', 'zalo account'];
    return phoneErrors.some((error) => errorMessage.toLowerCase().includes(error.toLowerCase()));
  }
}
