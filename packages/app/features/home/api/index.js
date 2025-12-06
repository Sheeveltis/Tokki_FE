/**
 * Home API: Xử lý logic nghiệp vụ, thuật toán, và gọi API để lấy/xử lý dữ liệu
 * 
 * Nguyên tắc:
 * - Chứa các hàm thuật toán, tính toán
 * - Gọi API để lấy/xử lý dữ liệu
 * - Định dạng dữ liệu trả về từ API
 * - KHÔNG chứa mã giao diện (JSX)
 */

// Mock data cho demo - thay bằng API thật khi backend sẵn sàng
const MOCK_HOME_DATA = {
  title: 'Chào Mừng Đến Với Tokki',
  subtitle: 'Nền tảng học tiếng Hàn hiệu quả',
  content: 'Tokki là ứng dụng học tiếng Hàn được thiết kế để giúp bạn nắm vững ngôn ngữ một cách dễ dàng và thú vị. Khám phá các bài học, từ vựng, và bài tập thực hành ngay hôm nay!',
  marketingContent: {
    headline: 'Muốn có người yêu Hàn Quốc? Tải Tokki trước đã!',
    intro: 'Người ta nói "Yêu nhau mấy núi cũng trèo", còn muốn hiểu Oppa nói gì thì phải leo vào Tokki ngay và luôn!',
    timeCommitment: 'Chỉ 15p mỗi ngày (bằng thời gian lướt TikTok thôi à), bạn sẽ nhận được gì?',
    benefits: [
      'Một "chiếc" app giao diện cute xỉu, nhìn là muốn học.',
      'Một lộ trình từ A đến Z, cân mọi kèo từ Sơ cấp đến TOPIK.',
      'Một người bạn AI kiên nhẫn, sửa lỗi phát âm 24/7 không biết mệt.',
    ],
    closing: 'Tokki không hứa giúp bạn có người yêu, nhưng hứa giúp bạn "over hợp" với tiếng Hàn!',
  },
  items: [
    {
      title: 'Bài Học Mới',
      description: 'Khám phá các bài học mới nhất được cập nhật hàng tuần',
    },
    {
      title: 'Từ Vựng',
      description: 'Học từ vựng theo chủ đề với hình ảnh và ví dụ minh họa',
    },
    {
      title: 'Luyện Tập',
      description: 'Thực hành với các bài tập tương tác và kiểm tra kiến thức',
    },
  ],
}

const MOCK_SIDEBAR_DATA = {
  description: 'Tokki giúp bạn học tiếng Hàn một cách hiệu quả và thú vị. Bắt đầu hành trình của bạn ngay hôm nay!',
  links: [
    'Hướng dẫn sử dụng',
    'Câu hỏi thường gặp',
    'Liên hệ hỗ trợ',
  ],
}

/**
 * Lấy dữ liệu trang chủ
 * 
 * @returns {Promise<Object>} Dữ liệu trang chủ
 */
export const getHomeData = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        // Giả lập xử lý dữ liệu (format, transform, etc.)
        const formattedData = {
          ...MOCK_HOME_DATA,
          // Có thể thêm logic format, tính toán ở đây
          lastUpdated: new Date().toISOString(),
        }
        resolve(formattedData)
      } catch (err) {
        reject(new Error('Không thể tải dữ liệu trang chủ'))
      }
    }, 500)
  })
}

/**
 * Lấy dữ liệu sidebar
 * 
 * @returns {Promise<Object>} Dữ liệu sidebar
 */
export const getSidebarData = async () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(MOCK_SIDEBAR_DATA)
      } catch (err) {
        reject(new Error('Không thể tải dữ liệu sidebar'))
      }
    }, 300)
  })
}

/**
 * Xử lý logic nghiệp vụ khác (ví dụ: format, tính toán, sắp xếp)
 * 
 * @param {Array} items - Danh sách items cần xử lý
 * @returns {Array} Danh sách đã được xử lý
 */
export const processHomeItems = (items) => {
  if (!Array.isArray(items)) return []
  
  // Ví dụ: sắp xếp, filter, format, etc.
  return items
    .filter(item => item && item.title)
    .sort((a, b) => a.title.localeCompare(b.title))
}

