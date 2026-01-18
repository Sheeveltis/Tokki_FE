// Platform-specific export: tự động chọn .web.jsx trên web, .native.jsx trên mobile
import { Platform } from 'react-native'
import { AuthLayout as AuthLayoutWeb } from './auth-layout.web'
import { AuthLayout as AuthLayoutNative } from './auth-layout.native'

// Export đúng platform
export const AuthLayout = Platform.OS === 'web' ? AuthLayoutWeb : AuthLayoutNative

