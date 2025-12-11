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

/**
 * Lấy thống kê sơ bộ blog (totalBlogs, totalViews, totalPublished)
 */
export const getBlogSummary = async () => {
  const res = await apiClient.get(ENDPOINTS.STATISTIC_BLOG.DASHBOARD)
  return res?.data?.data || { totalBlogs: 0, totalViews: 0, totalPublished: 0 }
}

/**
 * Top blog nhiều lượt xem
 */
export const getTopBlogsByViews = async (count = 5) => {
  const res = await apiClient.get(ENDPOINTS.STATISTIC_BLOG.TOP_BLOGS(count))
  const data = res?.data?.data
  return Array.isArray(data) ? data : []
}

/**
 * Top người đăng bài nổi bật
 */
export const getTopAuthors = async (count = 5) => {
  const res = await apiClient.get(ENDPOINTS.STATISTIC_BLOG.TOP_AUTHORS(count))
  const data = res?.data?.data
  return Array.isArray(data) ? data : []
}

/**
 * Danh sách blog cho admin với pagination
 */
export const getBlogsAdmin = async ({ pageNumber = 1, pageSize = 10, status } = {}) => {
  const params = { PageNumber: pageNumber, PageSize: pageSize }
  if (status !== undefined && status !== null && status !== '') {
    params.Status = status
  }
  const res = await apiClient.get(ENDPOINTS.BLOG.ADMIN_LIST, { params })
  const data = res?.data?.data || {}
  const items = Array.isArray(data.items) ? data.items.map((item) => ({
    ...item,
    // Chuẩn hóa để bảng hiển thị
    authorName: item.authorName || item.authorId,
  })) : []
  console.log('items', items)
  console.log('data', data)
  return {
    items,
    totalPages: data.totalPages || 1,
    totalCount: data.totalCount || (data.items?.length || 0),
    pageNumber: data.pageNumber || pageNumber,
    pageSize: data.pageSize || pageSize,
  }
}

/**
 * Lấy tất cả danh mục blog
 * @returns {Promise<Array>} Danh sách category
 */
export const getAllCategories = async () => {
  const res = await apiClient.get(ENDPOINTS.CATEGORY.GET_ALL)
  const data = res?.data?.data
  return Array.isArray(data) ? data : []
}

/**
 * Tạo bài viết blog mới
 * @param {Object} payload - Dữ liệu bài viết
 * @param {string} payload.title - Tiêu đề
 * @param {string} payload.thumbnailUrl - Link ảnh bìa
 * @param {string} payload.content - Nội dung HTML
 * @param {string} payload.shortDescription - Mô tả ngắn
 * @param {number} payload.status - Trạng thái (0: Draft, 1: Published, etc.)
 * @param {string} payload.categoryId - ID danh mục
 * @param {string[]} payload.tags - Mảng các tag
 * @returns {Promise<Object>} Response data
 */
export const createBlog = async (payload) => {
  const res = await apiClient.post(ENDPOINTS.BLOG.CREATE, payload)
  // Response format: { isSuccess: true, data: {...}, errors: null, message: '...', statusCode: 200 }
  return res.data
}

// Alias to match the import in CreateBlogScreen (if you want to keep using createArticle)
export const createArticle = createBlog