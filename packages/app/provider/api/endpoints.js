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
    },
  }
