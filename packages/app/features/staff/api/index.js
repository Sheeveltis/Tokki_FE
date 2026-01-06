// Staff Panel API functions - reuse từ admin API
// Staff có quyền hạn giới hạn hơn admin

import { fetchLessons, fetchArticles, fetchFeedbacks, sendEmail, handleApiError as adminHandleApiError } from '../../admin/api'
import { fetchUsers as fetchUsersApi } from '../../user/screens/UserManagement/api/api'
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
    const res = await fetchUsersApi()

    // Hỗ trợ cả response dạng array (mock) hoặc dạng { items, total, ... } từ API thật
    const items = Array.isArray(res) ? res : Array.isArray(res?.items) ? res.items : []

    const normalizeRole = (role) => {
      const num = Number(role)
      if (!Number.isNaN(num)) return num
      // fallback cho string
      const lower = String(role ?? '').toLowerCase()
      if (lower === 'admin') return 1
      if (lower === 'staff') return 2
      if (lower === 'user') return 0
      return role
    }

    const normalizeStatus = (status) => {
      const num = Number(status)
      if (!Number.isNaN(num)) return num
      if (typeof status === 'string') return status
      return status
    }

    const mapped = items
      .map((u) => {
        const roleLabel = normalizeRole(u?.role)
        return {
          ...u,
          id: u.id || u.userId || u.userID,
          role: roleLabel,
          roleLabel: ['User', 'Admin', 'Staff'][roleLabel] || roleLabel,
          status: normalizeStatus(u?.status),
          name: u.name || u.fullName || '',
          fullName: u.fullName || u.name || '',
        }
      })
      // Chỉ lấy Users (role 0/3/4)
      .filter((u) => [0, 3, 4].includes(Number(u.role)))

    return mapped
  } catch (error) {
    adminHandleApiError(error, 'Không thể tải danh sách người dùng')
  }
}

