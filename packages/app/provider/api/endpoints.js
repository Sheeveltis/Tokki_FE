const DOMAIN = 'http://localhost:5031'
const PREFIX = '/api'

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
    },
    ACCOUNT: {
      LOGIN: '/Account/login',
      REGISTER: '/Account/register',
      FORGOT_PASSWORD_RESET: '/Account/forgot-password/reset',
      PROFILE: '/Account/profile',
      ME: '/Account/me',
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
    },
    MINIGAME: {
      MATCHING_CARDS: '/minigame/matching-cards',
    },
    REPORT: {
      CREATE: '/Report',
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
    },
    CLOUDINARY: {
      UPLOAD_VOCABULARY_IMAGE: '/cloudinary/vocabulary-image',  // POST: Upload ảnh từ vựng lên Cloudinary
      UPLOAD_TOPIC_IMAGE: '/cloudinary/topic-image',  // POST: Upload ảnh chủ đề lên Cloudinary
    }
  }
