/**
 * HomeLayout wrapper: Tự động chọn .web.jsx hoặc .native.jsx
 * 
 * React Native bundler sẽ tự động resolve platform-specific file.
 * File này chỉ để TypeScript/IDE resolve đúng.
 */

// Export từ platform-specific file
// React Native sẽ tự động chọn đúng file khi build
export { HomeLayout } from './home-layout.web'

