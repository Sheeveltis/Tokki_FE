import { useQuery } from '@tanstack/react-query'
import {
  fetchUsers,
  fetchLessons,
  fetchArticles,
  fetchSystemLogs,
  fetchPayments,
  fetchFeedbacks,
  fetchPackages,
  fetchAIStatistics,
  fetchExamTemplates,
} from './index'

// Common options for admin data (reduce refetch noise, cache for 5 minutes)
const commonOptions = {
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
}

export const useUsersQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'users'],
    queryFn: fetchUsers,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useLessonsQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'lessons'],
    queryFn: fetchLessons,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useArticlesQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'articles'],
    queryFn: fetchArticles,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useSystemLogsQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'system-logs'],
    queryFn: fetchSystemLogs,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const usePaymentsQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'payments'],
    queryFn: fetchPayments,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useFeedbacksQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'feedbacks'],
    queryFn: fetchFeedbacks,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const usePackagesQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'packages'],
    queryFn: fetchPackages,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useAIStatisticsQuery = (initialData = null) =>
  useQuery({
    queryKey: ['admin', 'ai-statistics'],
    queryFn: fetchAIStatistics,
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })

export const useExamTemplatesQuery = (params = {}, initialData = null) => {
  const { pageNumber = 1, pageSize = 10, searchTerm = '', status = 1, type = null } = params
  
  return useQuery({
    queryKey: ['admin', 'exam-templates', pageNumber, pageSize, searchTerm, status, type],
    queryFn: () => fetchExamTemplates({ pageNumber, pageSize, searchTerm, status, type }),
    initialData: initialData || undefined,
    enabled: !initialData,
    ...commonOptions,
  })
}

