import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

/**
 * Xử lý response từ API blog
 * Format: { isSuccess: true, data: {...}, errors: null, message: '...', statusCode: 200 }
 * data có thể là array hoặc object chứa items/totalPages
 */
const parseBlogResponse = (response, pageSize) => {
  let blogs = []
  let totalPages = 1
  
  // Lấy data từ response.data (nếu có)
  const data = response?.data || response
  
  if (Array.isArray(data)) {
    // Nếu data là array trực tiếp
    blogs = data
    totalPages = Math.ceil(data.length / pageSize)
  } else if (data?.items && Array.isArray(data.items)) {
    // Format: { items: [...], totalPages: ... }
    blogs = data.items
    totalPages = data.totalPages || Math.ceil((data.totalCount || blogs.length) / pageSize)
  } else if (data?.data && Array.isArray(data.data)) {
    // Format: { data: [...], totalPages: ... }
    blogs = data.data
    totalPages = data.totalPages || Math.ceil((data.totalCount || blogs.length) / pageSize)
  } else if (Array.isArray(response)) {
    // Fallback: nếu response là array trực tiếp
    blogs = response
    totalPages = Math.ceil(response.length / pageSize)
  }
  
  return { blogs, totalPages }
}

/**
 * Lấy danh sách blog với pagination
 * @param {Object} params
 * @param {number} params.pageNumber - Số trang (bắt đầu từ 1)
 * @param {number} params.pageSize - Số blog mỗi trang
 * @param {string} params.categoryId - ID danh mục (optional)
 * @param {number} params.status - Trạng thái (0: draft, 1: published)
 * @returns {Promise<{blogs: Array, totalPages: number}>}
 */
export const getAllBlogs = async ({ pageNumber, pageSize, categoryId, status } = {}) => {
  const params = {}

  if (pageNumber != null) params.PageNumber = pageNumber
  if (pageSize != null) params.PageSize = pageSize
  if (categoryId) params.CategoryId = categoryId
  if (status != null) params.Status = status

  const res = await apiClient.get(ENDPOINTS.BLOG.GET_ALL, { params })
  // Response format: { isSuccess: true, data: {...}, errors: null, message: '...', statusCode: 200 }
  const response = res.data
  return parseBlogResponse(response, pageSize || 10)
}

/**
 * Extract ID từ slug
 * Slug format: "10-quy-tac-bat-di-bat-dich-abc123"
 * ID là phần cuối cùng sau dấu gạch ngang cuối cùng: "abc123"
 */
const extractIdFromSlug = (slug) => {
  if (!slug) return null
  // Tách slug bằng dấu gạch ngang và lấy phần cuối cùng
  const parts = slug.split('-')
  return parts[parts.length - 1]
}

/**
 * Xử lý response từ API blog detail
 * Format: { isSuccess: true, data: {...}, errors: null, message: '...', statusCode: 200 }
 */
const parseBlogDetailResponse = (response) => {
  // Lấy data từ response.data
  if (response?.data) {
    return response.data
  }
  // Fallback: trả về response nếu không có format chuẩn
  return response
}

/**
 * Lấy blog theo ID
 * @param {string} id - ID của blog
 * @returns {Promise<Object>} Blog data
 */
export const getBlogById = async (id) => {
  const res = await apiClient.get(ENDPOINTS.BLOG.GET_BY_ID(id))
  // Response format: { isSuccess: true, data: {...}, errors: null, message: '...', statusCode: 200 }
  const response = res.data
  return parseBlogDetailResponse(response)
}

/**
 * Lấy blog theo slug
 * Tự động extract ID từ slug (phần cuối cùng) và gọi getBlogById
 * @param {string} slug - Slug của blog (ví dụ: "10-quy-tac-bat-di-bat-dich-abc123")
 * @returns {Promise<Object>} Blog data
 */
export const getBlogBySlug = async (slug) => {
  const id = extractIdFromSlug(slug)
  if (!id) {
    throw new Error('Không thể extract ID từ slug')
  }
  return getBlogById(id)
}

// Alias để tương thích với code cũ
export const getBlogDetail = getBlogBySlug