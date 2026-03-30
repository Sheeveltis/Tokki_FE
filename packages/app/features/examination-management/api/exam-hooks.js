import { useQuery } from '@tanstack/react-query'
import { fetchExamsAdmin, fetchExamDetailAdmin, fetchExamById, fetchExamStatsAdmin, fetchExamParticipantsAdmin } from './exam-management.js'

/**
 * React Query hook để lấy danh sách exams cho admin
 * @param {Object} params - Query parameters
 * @param {number} params.PageNumber - Số trang
 * @param {number} params.PageSize - Số items mỗi trang
 * @param {string} params.SearchTerm - Tìm kiếm theo từ khóa
 * @param {number} params.Status - Filter theo status (0=Draft, 1=Published, 2=Deleted)
 * @param {number} params.Type - Filter theo type (1=TopikI, 2=TopikII, 3=EntranceTest)
 */
export const useExamsAdmin = (params = {}) => {
  const { PageNumber = 1, PageSize = 20, SearchTerm, Status, Type } = params

  return useQuery({
    queryKey: ['exams', 'admin', PageNumber, PageSize, SearchTerm, Status, Type],
    queryFn: () => fetchExamsAdmin({ PageNumber, PageSize, SearchTerm, Status, Type }),
    staleTime: 2 * 60 * 1000, // 2 phút
  })
}

/**
 * React Query hook để lấy chi tiết exam theo ID (admin)
 * @param {string} examId - ID của exam
 */
export const useExamDetailAdmin = (examId) => {
  return useQuery({
    queryKey: ['exam', 'admin', 'detail', examId],
    queryFn: () => fetchExamDetailAdmin(examId),
    enabled: !!examId, // Chỉ fetch khi có examId
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * React Query hook để lấy thống kê exam theo ID (admin)
 * @param {string} examId - ID của exam
 */
export const useExamStatsAdmin = (examId) => {
  return useQuery({
    queryKey: ['exam', 'admin', 'stats', examId],
    queryFn: () => fetchExamStatsAdmin(examId),
    enabled: !!examId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * React Query hook để lấy chi tiết exam theo ID
 * @param {string} examId - ID của exam
 */
export const useExamById = (examId) => {
  return useQuery({
    queryKey: ['exam', examId],
    queryFn: () => fetchExamById(examId),
    enabled: !!examId, // Chỉ fetch khi có examId
    staleTime: 5 * 60 * 1000, // 5 phút
  })
}

/**
 * React Query hook để lấy danh sách người tham gia thi cho admin
 * @param {Object} params
 */
export const useExamParticipantsAdmin = (params = {}) => {
  const { examId, PageNumber = 1, PageSize = 10, SortBy = 0, IsDescending = true } = params
  
  return useQuery({
    queryKey: ['exam', 'admin', 'participants', examId, PageNumber, PageSize, SortBy, IsDescending],
    queryFn: () => fetchExamParticipantsAdmin({ examId, PageNumber, PageSize, SortBy, IsDescending }),
    enabled: !!examId,
  })
}
