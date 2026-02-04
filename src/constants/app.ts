export const API_CONFIG = {
  PAGINATION: {
    DEFAULT_SIZE: 10,
    DROPDOWN_SIZE: 100,
    MAX_SIZE: 1000, // Dùng cho các dropdown/lookup cần lấy tất cả dữ liệu
  },
};

export const UI_MESSAGES = {
  ERROR: {
    LOAD_FAILED: 'Không thể tải dữ liệu',
    SAVE_FAILED: 'Lưu thất bại',
    DELETE_FAILED: 'Xóa thất bại',
    ACTION_FAILED: 'Thao tác thất bại',
    MISSING_INPUT: 'Vui lòng điền đầy đủ thông tin',
    PASSWORD_MISMATCH: 'Mật khẩu không khớp',
  },
  SUCCESS: {
    SAVE: 'Lưu thành công',
    DELETE: 'Xóa thành công',
    UPDATE: 'Cập nhật thành công',
    CREATE: 'Tạo mới thành công',
    ACTION: 'Thao tác thành công',
  },
  UNKNOWN_TABLE: 'Không xác định',
  AT_COUNTER: 'Tại quầy',
  TABLE: {
    PREFIX: 'Bàn',
  },
};

export const ROLES = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
  CASHIER: 'Thu ngân',
  CHEF: 'Đầu bếp',
};

export const USER_STATUS = {
  ACTIVE: 'Đang hoạt động',
  BANNED: 'Đã khóa',
};