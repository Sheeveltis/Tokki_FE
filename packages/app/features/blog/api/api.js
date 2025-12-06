import { apiClient } from '../../../provider/api/client'
import { ENDPOINTS } from '../../../provider/api/endpoints'

export const getAllBlogs = async ({ pageNumber, pageSize, categoryId, status } = {}) => {

  const params = {};

  if (pageNumber != null) params.PageNumber = pageNumber;
  if (pageSize != null) params.PageSize = pageSize;
  if (categoryId) params.CategoryId = categoryId;
  if (status != null) params.Status = status; // 0 hợp lệ → không dùng if(status)

  const res = await apiClient.get(ENDPOINTS.BLOG.GET_ALL, { params });
  return res.data;
};
export const getBlogById = async (id) => {
  const res = await apiClient.get(ENDPOINTS.BLOG.GET_BY_ID(id))
  return res.data
}