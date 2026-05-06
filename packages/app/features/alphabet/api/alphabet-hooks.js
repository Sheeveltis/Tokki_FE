import { useQuery } from '@tanstack/react-query'
import { fetchAlphabet, fetchAlphabetPaginated } from './index.js'

/**
 * React Query hook to fetch alphabet data (all)
 */
export const useAlphabet = (params = {}) => {
  return useQuery({
    queryKey: ['alphabet', params],
    queryFn: () => fetchAlphabet(params),
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * React Query hook to fetch alphabet data with pagination
 */
export const useAlphabetPaginated = (params = {}) => {
  return useQuery({
    queryKey: ['alphabet', 'paginated', params],
    queryFn: () => fetchAlphabetPaginated(params),
    staleTime: 5 * 60 * 1000,
    keepPreviousData: true,
  })
}
