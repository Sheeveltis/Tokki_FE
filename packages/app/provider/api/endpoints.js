import { Platform } from 'react-native'

/**
 * Cấu hình API Domain
 * - Web: sử dụng localhost
 * - Mobile: sử dụng IP của máy chủ backend (cần thay đổi theo IP thực tế của máy bạn)
 * 
 * Để lấy IP của máy:
 * - Windows: mở CMD và chạy `ipconfig`, tìm "IPv4 Address" (thường là 192.168.x.x)
 * - Mac/Linux: mở Terminal và chạy `ifconfig` hoặc `ip addr`, tìm IP của WiFi/Ethernet
 * 
 * Ví dụ: Nếu IP của máy là 192.168.1.100, thì MOBILE_DOMAIN = 'http://192.168.1.100:5031'
 */
  const WEB_DOMAIN = 'https://tokki-be-hneqd2a3dfhmfnhq.koreacentral-01.azurewebsites.net'
  // ⚠️ THAY ĐỔI IP NÀY THÀNH IP THỰC TẾ CỦA MÁY BẠN
// Tìm IP bằng cách: Windows (ipconfig) hoặc Mac/Linux (ifconfig)
const MOBILE_DOMAIN = 'http://192.168.1.100:5031' // Thay đổi IP này!

const PREFIX = '/api'

// Tự động chọn domain dựa trên platform
const DOMAIN = Platform.OS === 'web' ? WEB_DOMAIN : MOBILE_DOMAIN

export const API_BASE_URL = `${DOMAIN}${PREFIX}`

export const ENDPOINTS = {
    BLOG: {
      GET_ALL: '/Blog',              
      GET_BY_ID: (id) => `/Blog/${id}`,
      CREATE: '/Blog',                // POST: Tạo mới
      UPDATE: (id) => `/Blog/${id}`,    
      DELETE: (id) => `/Blog/${id}`,     
      ADMIN_LIST: '/Blog', // same endpoint, nhưng dùng kèm query pageNumber/pageSize
    },
    STATISTIC_BLOG: {
      DASHBOARD: '/StatisticBlog/dashboard',
      TOP_BLOGS: (count = 5) => `/StatisticBlog/top-blogs?count=${count}`,
      TOP_AUTHORS: (count = 5) => `/StatisticBlog/top-authors?count=${count}`,
    },
    CATEGORY: {
      GET_ALL: '/Category',
    },
    PAYMENT: {
      CREATE: '/Payment',
      GET_QR_BY_ID: (id) => `/Payment/${id}/qr`,
      GET_BY_ID: (id) => `/Payment/${id}`,
      HISTORY_TOKEN_USER: '/Payment/history-token-user', // GET: Lấy lịch sử thanh toán của user hiện tại
    },
    VIP_PACKAGE: {
      GET_ALL: '/VipPackage',
    },
    ACCOUNT: {
      LOGIN: '/Account/login',
      REGISTER: '/Account/register',
      FORGOT_PASSWORD_RESET: '/Account/forgot-password/reset',
      PROFILE: '/Account/profile',
      ME: '/Account/me',
      LEVEL: '/Account/me/level',
      GET_ALL: '/Account/get-all',
      DETAIL: (id) => `/Account/detail/${id}`,
      CREATE_ACCOUNT: '/Account/create-account',
      UPDATE_USER: '/Account/update-user',
      DELETE: (id) => `/Account/${id}`,
    },
    OTP: {
      SEND_EMAIL_VERIFICATION: '/Otp/send-otp-for-email-verification',
      VERIFY_LOGIN_OTP: '/Otp/verify-login-otp',
      SEND_FORGOT_PASSWORD: '/Otp/forgot-password/send-otp',
      VERIFY_FORGOT_PASSWORD: '/Otp/forgot-password/verify',
    },
    COMMENT: {
      CREATE: '/Comment',
      GET_BY_BLOG: (blogId) => `/Comment/blog/${blogId}`,
    },
    LIVE_CHAT: {
      GET_MY_ROOMS: '/Chat/my-rooms',
      REQUEST_SUPPORT: '/Chat/support/request',
      GET_PENDING_SUPPORT: '/Chat/support/pending',
      JOIN_SUPPORT: (roomId) => `/Chat/support/${roomId}/join`,
      GET_HISTORY: (roomId) => `/Chat/${roomId}/history`,
    },
    TOPIC: {
      CREATE: '/Topics',
      ADMIN_GET_ALL: '/Topics/admin/get-all',
      USER_GET_ALL: '/Topics/user/get-all',
      GET_BY_ID: (id) => `/Topics/${id}`,
      DELETE: (id) => `/Topics/${id}`,
      ADD_VOCABULARIES: '/Topics/vocabularies',
      ADMIN_REMOVE_VOCABULARIES: '/Topics/admin/vocabularies',
      PUBLISH: (topicId) => `/Topics/${topicId}/publish`,
      UPDATE: '/Topics/update',
    },
    VOCABULARY: {
      ADMIN_GET_ALL: '/Vocabulary/admin/get-all',
      ADMIN_CREATE: '/Vocabulary/admin/create-a-vocabulary',
      ADD_VOCABULARY_LIST: '/Vocabulary/bulk',
      FLASH_CARD_TOPIC: '/Vocabulary/flash-card',
      GET_BY_ID: (id) => `/Vocabulary/${id}`,
      USER_GET_DETAIL: (id) => `/Vocabulary/user/get-detail/${id}`,
      UPDATE: (id) => `/Vocabulary/${id}`,
      DELETE: (id) => `/Vocabulary/${id}`,
      ADD_EXAMPLES: '/vocabulary-examples/admin/add',
      UPDATE_EXAMPLE: (exampleId) => `/vocabulary-examples/admin/${exampleId}`,
      DELETE_EXAMPLE: (exampleId) => `/vocabulary-examples/admin/${exampleId}`,
      USER_GET_EXAMPLES: (vocabId) => `/vocabulary-examples/user/${vocabId}`,
    },
    MINIGAME: {
      MATCHING_CARDS: '/minigame/matching-cards',
    },
    GAMES: {
      USER_GET_ALL: '/Games/user/get-all', // GET: Lấy danh sách games cho user (query: pageNumber, pageSize)
      HAS_PLAYED_LEVEL: '/Games/user/has-played-level', // GET: Check xem user đã chơi level này chưa (query: gameId, topicId, gameDifficulty)
      SAVE_RESULT: '/Games/user/save-result', // POST: Lưu điểm game mới
      UPDATE_RESULT: '/Games/user/result', // PUT: Cập nhật điểm game đã có
      GET_ALL_USER_RESULTS: '/Games/user/get-all-user-results', // GET: Lấy bảng xếp hạng user results (query: gameId, topicId, gameDifficulty, pageNumber, pageSize)
    },
    REPORT: {
      CREATE: '/Report',
    },
    STATISTICS: {
      OVERVIEW: '/Statistics/overview', // GET: Thống kê tổng quan doanh thu
      TRANSACTIONS: '/Statistics/transactions', // GET: Lịch sử giao dịch (query: search, status, fromDate, toDate, page, pageSize)
      PACKAGES: '/Statistics/packages', // GET: Doanh thu theo gói thành viên
    },
    FAVORITES: {
      GET_ALL: '/Favorites/favorites',   // GET: Lấy danh sách từ vựng yêu thích (có pagination và search)
      ADD: '/Favorites',      // POST: Thêm vào danh sách yêu thích
      REMOVE: '/Favorites',    // DELETE: Xóa khỏi danh sách yêu thích
    },
    SPACED_REPETITION: {
      SUBMIT: '/spaced-repetition/submit',  // POST: Submit kết quả học tập
    },
    GAMIFICATION: {
      HEARTBEAT: '/Gamification/heartbeat',  // POST: Heartbeat để track thời gian học tập
      PROGRESS: (userId) => `/Gamification/progress/${userId}`,  // GET: Lấy thông tin progress (level, XP, streak, title)
    },
    TITLE: {
      GET_BY_ID: (id) => `/Title/${id}`,  // GET: Lấy thông tin title theo ID
    },
    LEADERBOARD: {
      GET_ALL: '/Leaderboard',  // GET: Lấy danh sách leaderboard (query: timeFrame, top)
    },
    CLOUDINARY: {
      UPLOAD_VOCABULARY_IMAGE: '/cloudinary/vocabulary-image',  // POST: Upload ảnh từ vựng lên Cloudinary
      UPLOAD_TOPIC_IMAGE: '/cloudinary/topic-image',  // POST: Upload ảnh chủ đề lên Cloudinary
      UPLOAD_AVATAR: '/cloudinary/avatar',  // POST: Upload avatar lên Cloudinary
      UPLOAD_TEMPLATE_PART_IMAGE: '/cloudinary/template-part-image',  // POST: Upload ảnh template part lên Cloudinary
    },
    EXCEL: {
      ADD_VOCAB_TO_TOPIC: (topicId) => `/Excel/add-vocab?topicId=${topicId}`,  // POST: Import từ vựng từ Excel vào chủ đề
      EXPORT_BY_TOPIC: (topicId) => `/Excel/export-by-topic/${topicId}`,  // GET: Export từ vựng của chủ đề ra Excel
    },
    EMAIL: {
      CAMPAIGNS_CREATE: '/email-campaigns',           // POST: Tạo chiến dịch email thủ công
      TEMPLATE_CREATE: '/EmailTemplate',              // POST: Tạo email template tự động
    },
    EXAM_TEMPLATES: {
      ADMIN_LIST: '/ExamTemplates/admin',              // GET: Lấy danh sách exam templates cho admin (query: PageNumber, PageSize, SearchTerm, Status, Type)
      GET_BY_ID: (id) => `/ExamTemplates/${id}`,      // GET: Lấy chi tiết exam template
      CREATE: '/ExamTemplates',                        // POST: Tạo exam template mới
      UPDATE: (id) => `/ExamTemplates/${id}`,          // PUT: Cập nhật exam template
      DELETE: (id) => `/ExamTemplates/${id}`,         // DELETE: Xóa exam template
      TEMPLATE_PARTS: '/ExamTemplates/TemplateParts',  // POST: Thêm/cập nhật template parts
      DUPLICATE: (id) => `/ExamTemplates/${id}/duplicate`,  // POST: Sao chép exam template
    },
    QUESTION_TYPE: {
      GET_ALL: '/QuestionType',                        // GET: Lấy danh sách question types (query: skill, examType)
    },
  }
