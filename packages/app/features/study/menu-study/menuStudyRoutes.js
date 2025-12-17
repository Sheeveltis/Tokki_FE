/**
 * Định nghĩa route cho các module trong MenuStudy
 * Tách riêng file này để dễ quản lý mapping module -> URL
 */

/**
 * Lấy đường dẫn cần điều hướng dựa theo module, item và level hiện tại
 * @param {Object} params
 * @param {string} params.moduleId
 * @param {string} [params.itemLabel]
 * @param {number} [params.levelId]
 * @returns {string|null}
 */
export function getMenuStudyRoute({ moduleId, itemLabel, levelId }) {
  // Module TỪ VỰNG - đi tới trang flashcard
  if (moduleId === 'vocabulary') {
    // Phân biệt từng item theo label
    switch (itemLabel) {
      case 'Minigame':
        // Trang tổng minigame (đang dùng cho Matching Card, có query level)
        if (levelId) {
          return `/minigame?level=${levelId}`
        }
        return '/minigame'
      case 'Chủ đề':
      default:
        // Chủ đề từ vựng đi tới flashcard theo level
        if (levelId) {
          return `/flashcard?level=${levelId}`
        }
        return '/flashcard'
    }
  }

  // Module BẢNG CHỮ CÁI
  if (moduleId === 'alphabet') {
    return '/alphabet'
  }

  // Module NGHE
  if (moduleId === 'listening') {
    switch (itemLabel) {
      case 'Radio':
        return '/listening/radio'
      case 'Podcast':
        return '/listening/podcast'
      case 'Nhạc':
        return '/listening/music'
      case 'Nghe chép chính tả':
        return '/listening/dictation'
      default:
        return '/listening'
    }
  }

  // Module NÓI
  if (moduleId === 'speaking') {
    switch (itemLabel) {
      case 'Nghe chép chính tả':
        return '/speaking/dictation'
      case 'Luyện nói với A.I':
        return '/speaking/ai-practice'
      default:
        return '/speaking'
    }
  }

  // Module ĐỌC
  if (moduleId === 'reading') {
    switch (itemLabel) {
      case 'Blog':
        return '/reading/blog'
      case 'Truyện':
        return '/reading/story'
      case 'Báo':
        return '/reading/news'
      case 'Đọc văn bản':
        return '/reading/text'
      default:
        return '/reading'
    }
  }

  // Module VIẾT (image module)
  if (moduleId === 'writing') {
    return '/writing'
  }

  // Module NGỮ PHÁP (image module)
  if (moduleId === 'grammar') {
    return '/grammar'
  }

  return null
}

/**
 * Kiểm tra module có yêu cầu đăng nhập không
 * @param {string} moduleId
 * @returns {boolean}
 */
export function isLoginRequiredModule(moduleId) {
  return moduleId === 'speaking' || moduleId === 'writing'
}


