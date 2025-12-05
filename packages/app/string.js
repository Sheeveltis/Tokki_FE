// Shared string and typography constants.
export const typography = {
  heading: 'Arimo, sans-serif',
  body: 'Arimo, sans-serif',
};

export const strings = {
  appName: 'Tokki',
};

// Status labels for User
export const statusUser = {
  Active: 'Hoạt động',
  Suspended: 'Đã tạm dừng',
  active: 'Hoạt động',
  inactive: 'Không hoạt động',
  pending: 'Chờ xác nhận',
  blocked: 'Bị khóa',
  deleted: 'Đã xóa',
};

// Status labels for Payment
export const statusPayment = {
  pending: 'Chờ thanh toán',
  completed: 'Đã thanh toán',
  paid: 'Đã thanh toán',
  failed: 'Thất bại',
  refunded: 'Đã hoàn trả',
  cancelled: 'Đã hủy',
};

// Status labels for Feedback
export const statusFeedback = {
  new: 'Mới',
  'in-progress': 'Đang xử lý',
  inProgress: 'Đang xử lý',
  resolved: 'Đã giải quyết',
  closed: 'Đã đóng',
};

// Status labels for Package/Membership
export const statusPackage = {
  active: 'Hoạt động',
  inactive: 'Tạm dừng',
};

// Status labels for Article/Blog
export const statusArticle = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
};

// --- PHẦN MỚI THÊM VÀO: API ERROR MESSAGES ---
export const apiErrors = {
  // Nhóm 4xx: Lỗi từ phía Client
  400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu hoặc đường dẫn không tồn tại.',
  408: 'Hết thời gian chờ yêu cầu (Request Timeout).',

  // Nhóm 5xx: Lỗi từ phía Server
  500: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  502: 'Không thể kết nối đến máy chủ (Bad Gateway).',
  503: 'Dịch vụ đang bảo trì hoặc quá tải (Service Unavailable).',

  // Nhóm Lỗi Mạng & Khác
  network: 'Không có kết nối Internet. Vui lòng kiểm tra đường truyền.',
  timeout: 'Kết nối bị gián đoạn do phản hồi quá lâu.',
  unknown: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
  
  // Lỗi Logic nghiệp vụ chung (Tùy chọn)
  invalidData: 'Dữ liệu nhập vào không đúng định dạng.',
};

export default {
  typography,
  strings,
  statusUser,
  statusPayment,
  statusFeedback,
  statusPackage,
  statusArticle,
  apiErrors,
};