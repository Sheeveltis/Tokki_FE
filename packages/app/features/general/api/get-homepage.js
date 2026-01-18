import { useQuery } from '@tanstack/react-query'
import { getHomeData, getSidebarData } from './homepage-logic'

/**
 * React Query hook để lấy dữ liệu trang chủ
 */
export const useHomeData = () => {
  return useQuery({
    queryKey: ['home', 'data'],
    queryFn: getHomeData,
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * React Query hook để lấy dữ liệu sidebar
 */
export const useSidebarData = () => {
  return useQuery({
    queryKey: ['home', 'sidebar'],
    queryFn: getSidebarData,
    staleTime: 10 * 60 * 1000, // 10 phút - sidebar ít thay đổi
  })
}

