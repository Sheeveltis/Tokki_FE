// Helper để lấy Google Client ID trên native (không sử dụng import.meta)
// File này được import trên native platform

export const getGoogleClientId = () => {
  // Trên native, chỉ sử dụng process.env
  if (typeof process !== 'undefined' && process?.env?.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  }
  
  // Fallback: VITE_GOOGLE_CLIENT_ID nếu được inject vào process.env
  if (typeof process !== 'undefined' && process?.env?.VITE_GOOGLE_CLIENT_ID) {
    return process.env.VITE_GOOGLE_CLIENT_ID
  }
  
  return ''
}
