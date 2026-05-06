import { useState, useCallback, useEffect } from 'react'
import { fetchWordleVocabularies, rerollWordle, fetchSuitableVocabs, assignWordleVocab, fetchWordlePlayers, fetchWordleLeaderboard } from './wordle-list-api'
import { useManagementFilters } from '../../back-office/hooks/use-management-filters'

/**
 * Hook quản lý logic cho màn hình danh sách từ vựng Wordle
 */
export function useWordleVocabularyManagement() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })

  // Khởi tạo filters từ URL hoặc mặc định
  const [filters, setFilters] = useManagementFilters({
    searchTerm: '',
    level: 'all',
    date: null,
    page: 1,
    size: 20,
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchWordleVocabularies({
        PageNumber: filters.page,
        PageSize: filters.size,
        Date: filters.date,
        Level: filters.level === 'all' ? undefined : filters.level,
        SearchTerm: filters.searchTerm || undefined,
      })

      const pagingData = res?.data || {}
      setData(pagingData.items || [])
      setPagination({
        current: pagingData.pageNumber || 1,
        pageSize: pagingData.pageSize || 10,
        total: pagingData.totalCount || 0,
      })
    } catch (error) {
      console.error('Failed to load Wordle vocabularies:', error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (page, pageSize) => {
    setFilters((prev) => ({ ...prev, page, size: pageSize }))
  }

  const handleReroll = async (dailyWordleId) => {
    try {
      setLoading(true)
      await rerollWordle(dailyWordleId)
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('Failed to reroll Wordle:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const handleFetchSuitableVocabs = async (params) => {
    try {
      const res = await fetchSuitableVocabs({
        Level: params.level,
        PageNumber: params.page,
        PageSize: params.size,
        SearchTerm: params.searchTerm,
      })
      return res?.data || { items: [], totalCount: 0 }
    } catch (error) {
      console.error('Failed to fetch suitable vocabs:', error)
      return { items: [], totalCount: 0 }
    }
  }

  const handleAssignVocab = async (dailyWordleId, vocabularyId) => {
    try {
      setLoading(true)
      await assignWordleVocab(dailyWordleId, vocabularyId)
      await loadData()
      return { success: true }
    } catch (error) {
      console.error('Failed to assign Wordle vocab:', error)
      return { success: false, error }
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    loadData()
  }

  return {
    data,
    loading,
    pagination,
    filters,
    handleFilterChange,
    handlePaginationChange,
    handleReroll,
    handleFetchSuitableVocabs,
    handleAssignVocab,
    refreshData,
  }
}

/**
 * Hook quản lý danh sách người chơi Wordle
 */
export function useWordlePlayers(dailyWordleId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const loadData = useCallback(
    async (page = 1, size = 10) => {
      if (!dailyWordleId) return
      try {
        setLoading(true)
        const res = await fetchWordlePlayers(dailyWordleId, {
          pageIndex: page,
          pageSize: size,
        })
        const pagingData = res?.data || {}
        setData(pagingData.items || [])
        setPagination({
          current: pagingData.pageNumber || 1,
          pageSize: pagingData.pageSize || 10,
          total: pagingData.totalCount || 0,
        })
      } catch (error) {
        console.error('Failed to load Wordle players:', error)
      } finally {
        setLoading(false)
      }
    },
    [dailyWordleId]
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    pagination,
    loadData,
  }
}

/**
 * Hook quản lý bảng xếp hạng Wordle
 */
export function useWordleLeaderboard(dailyWordleId) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const loadData = useCallback(
    async (page = 1, size = 10) => {
      if (!dailyWordleId) return
      try {
        setLoading(true)
        const res = await fetchWordleLeaderboard(dailyWordleId, {
          pageIndex: page,
          pageSize: size,
          includePrivate: true,
        })
        const pagingData = res?.data || {}
        setData(pagingData.items || [])
        setPagination({
          current: pagingData.pageNumber || 1,
          pageSize: pagingData.pageSize || 10,
          total: pagingData.totalCount || 0,
        })
      } catch (error) {
        console.error('Failed to load Wordle leaderboard:', error)
      } finally {
        setLoading(false)
      }
    },
    [dailyWordleId]
  )

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    data,
    loading,
    pagination,
    loadData,
  }
}
