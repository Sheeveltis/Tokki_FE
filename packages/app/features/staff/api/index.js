// Staff Panel API functions - reuse từ admin API
// Staff có quyền hạn giới hạn hơn admin

import { fetchUsers, fetchLessons, fetchArticles, fetchFeedbacks, sendEmail, handleApiError as adminHandleApiError } from '../../admin/api'
import { fetchVocabularies, fetchFlashcardTopics } from '../../vocabulary/api'

// Re-export các functions mà staff có thể sử dụng
export {
  fetchLessons,
  fetchVocabularies,
  fetchFlashcardTopics,
  fetchArticles,
  fetchFeedbacks,
  sendEmail,
}

// Export handleApiError với tên ngắn hơn
export const handleApiError = adminHandleApiError

// Staff chỉ có thể xem users thường, không xem Admin/Staff
export async function fetchRegularUsers() {
  try {
    const users = await fetchUsers()
    // Lọc chỉ lấy users thường (không phải Admin/Staff)
    return users.filter((user) => user.role === 'User')
  } catch (error) {
    adminHandleApiError(error, 'Không thể tải danh sách người dùng')
  }
}

