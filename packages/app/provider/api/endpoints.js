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
    },
    VOCABULARY: {
      ADMIN_GET_ALL: '/Vocabulary/admin/get-all',
      ADD_VOCABULARY_LIST: '/Vocabulary/bulk',
      FLASH_CARD_TOPIC: '/Vocabulary/flash-card',
      GET_BY_ID: (id) => `/Vocabulary/${id}`,
      UPDATE: (id) => `/Vocabulary/${id}`,
      DELETE: (id) => `/Vocabularies/${id}`,
    }
  }
