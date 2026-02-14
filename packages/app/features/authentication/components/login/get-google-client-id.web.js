// Helper để lấy Google Client ID trên web (có thể sử dụng import.meta)
// File này chỉ được import trên web platform

export const getGoogleClientId = () => {
  // Ưu tiên Vite env (import.meta.env)
  // eslint-disable-next-line no-undef
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    // eslint-disable-next-line no-undef
    return import.meta.env.VITE_GOOGLE_CLIENT_ID
  }
  
  // Fallback: Next.js env (process.env)
  if (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  }
  
  return ''
}
