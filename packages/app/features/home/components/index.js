// Auto-import layout based on platform (web/native)
// React Native sẽ tự động chọn .web.jsx hoặc .native.jsx khi import từ './home-layout'

// Export các component để dùng trực tiếp
export { HomeMain } from './home-main'
export { HomeSidebar } from './home-sidebar'

// HomeLayout sẽ được import trực tiếp từ './home-layout' (React Native tự resolve .web/.native)

