import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'

const ROUTE_TITLES = {
  '/': 'Trang chủ',
  '/homepage': 'Trang chủ',
  '/profile': 'Hồ sơ cá nhân',
  '/user-profile': 'Hồ sơ cá nhân',
  '/leaderboard': 'Bảng xếp hạng',
  '/blog': 'Blog',
  '/minigame': 'Trò chơi',
  '/dictionary': 'Từ điển',
  '/payment-detail': 'Chi tiết thanh toán',
  '/payment-package': 'Gói thanh toán',
  '/premium-package': 'Gói Premium',
  '/payment-failed': 'Thanh toán thất bại',
  '/payment-success': 'Thanh toán thành công',
  '/error': 'Lỗi',
  
  // Study
  '/study': 'Học tập',
  '/alphabet': 'Bảng chữ cái',
  '/alphabet/letters': 'Học bảng chữ cái',
  '/alphabet/syllables': 'Học âm tiết',
  '/flashcard': 'Bộ từ vựng',
  '/flashcard/study': 'Luyện tập Flashcard',
  '/flashcard/learn': 'Học từ mới',
  '/flashcard/quiz': 'Trắc nghiệm',
  '/flashcard/test': 'Kiểm tra',
  '/flashcard/favorites': 'Từ vựng yêu thích',
  '/flashcard/learned': 'Từ vựng đã học',
  '/pronunciation': 'Luyện phát âm',
  
  // Roadmap
  '/roadmap': 'Lộ trình',
  '/roadmap/info': 'Thông tin lộ trình',
  '/roadmap/test': 'Kiểm tra đầu vào',
  '/roadmap/test/result': 'Kết quả kiểm tra',
  '/roadmap/learning': 'Tiến trình học tập',
  '/roadmap/tips': 'Mẹo học tập',

  // Auth
  '/login': 'Đăng nhập',
  '/register': 'Đăng ký',
  '/forgot-password': 'Quên mật khẩu',
  '/authentication/forgot-password': 'Quên mật khẩu',
  '/reset-password': 'Đặt lại mật khẩu',

  // Admin/Moderator/Staff
  '/admin': 'Quản trị viên',
  '/staff': 'Nhân viên',
  '/moderator': 'Người kiểm duyệt',
  '/admin-login': 'Đăng nhập Quản trị',
}

export function PageTitle() {
  const location = useLocation()
  const params = useParams()

  useEffect(() => {
    let title = 'Học tiếng Hàn' // Default title

    // Tìm title tương ứng với path hiện tại
    const path = location.pathname
    
    // Ưu tiên khớp chính xác
    if (ROUTE_TITLES[path]) {
      title = ROUTE_TITLES[path]
    } else {
      // Nếu không khớp chính xác, thử tìm theo prefix (cho các route có params)
      const matchingKey = Object.keys(ROUTE_TITLES).find(key => 
        key !== '/' && path.startsWith(key)
      )
      if (matchingKey) {
        title = ROUTE_TITLES[matchingKey]
      }
    }

    // Cập nhật document title theo format [Tên Screen | Tooki]
    document.title = `${title} | Tooki`
  }, [location, params])

  return null
}
