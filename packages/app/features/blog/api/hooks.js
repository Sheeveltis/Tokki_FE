/**
 * Blog API Hooks (React Query)
 * 使用 React Query 的 hooks
 */

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { getAllBlogs, getBlogBySlug, getAllCategories } from './index.js'

const PAGE_SIZE = 10

/**
 * React Query hook để lấy danh sách blog với pagination
 */
export const useBlogs = ({ pageNumber = 1, pageSize = PAGE_SIZE, categoryId, status = 1 } = {}) => {
  return useQuery({
    queryKey: ['blogs', pageNumber, pageSize, categoryId, status],
    queryFn: () => getAllBlogs({ pageNumber, pageSize, categoryId, status }),
    staleTime: 2 * 60 * 1000, // 2 phút
  })
}

/**
 * React Query hook để lấy blog theo slug
 */
export const useBlogBySlug = (slug) => {
  return useQuery({
    queryKey: ['blog', 'slug', slug],
    queryFn: () => getBlogBySlug(slug),
    enabled: !!slug, // Chỉ fetch khi có slug
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * React Query hook để lấy tất cả categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 30 * 60 * 1000, // 30 phút - categories ít thay đổi
  })
}

/**
 * Infinite query cho blog list với load more
 */
export const useBlogsInfinite = ({ pageSize = PAGE_SIZE, categoryId, status = 1 } = {}) => {
  return useInfiniteQuery({
    queryKey: ['blogs', 'infinite', pageSize, categoryId, status],
    queryFn: ({ pageParam = 1 }) =>
      getAllBlogs({ pageNumber: pageParam, pageSize, categoryId, status }),
    getNextPageParam: (lastPage, allPages) => {
      const { totalPages, blogs } = lastPage
      const currentPage = allPages.length
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000,
  })
}
