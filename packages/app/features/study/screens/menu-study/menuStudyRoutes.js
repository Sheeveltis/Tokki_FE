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
  // Mapping theo label chính xác từ UI mới
  if (itemLabel === 'Học từ vựng theo chủ đề') {
    return levelId ? `/flashcard?level=${levelId}` : '/flashcard'
  }
  if (itemLabel === 'Minigame từ vựng') {
    return levelId ? `/minigame?level=${levelId}` : '/minigame'
  }
  if (itemLabel === 'Ôn tập từ vựng đã học') {
    return '/flashcard/learned'
  }
  if (itemLabel === 'Luyện phát âm với AI') {
    return '/pronunciation'
  }
  if (itemLabel === 'Học bảng chữ cái cho người mới') {
    return '/alphabet'
  }
  if (itemLabel === 'Học lộ trình (Roadmap)') {
    return '/roadmap/learning'
  }
  if (itemLabel === 'Học TOPIK theo dạng') {
    return levelId ? `/topik/types?level=${levelId}` : '/topik/types'
  }
  if (itemLabel === 'Giải đề TOPIK') {
    return levelId ? `/topik/exams?level=${levelId}` : '/topik/exams'
  }

  // Fallback cho logic cũ nếu cần
  if (moduleId === 'vocabulary') {
    switch (itemLabel) {
      case 'Minigame':
        if (levelId) return `/minigame?level=${levelId}`
        return '/minigame'
      case 'Chủ đề':
      default:
        if (levelId) return `/flashcard?level=${levelId}`
        return '/flashcard'
    }
  }

  if (moduleId === 'alphabet') return '/alphabet'
  if (moduleId === 'speaking') return '/pronunciation'
  if (moduleId === 'listening') return '/listening'
  if (moduleId === 'reading') return '/reading'
  if (moduleId === 'writing') return '/writing'
  if (moduleId === 'grammar') return '/grammar'

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
