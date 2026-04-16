import { useCallback, useEffect, useState, useMemo } from 'react'
import { getPronunciationRules } from '../api'

/**
 * Hook xử lý logic cho PronunciationRulesScreen
 */
export function usePronunciationRules() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchRules = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPronunciationRules()
      setRules(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Error fetching pronunciation rules:', e)
      setError(e?.message || 'Không thể tải danh sách quy tắc phát âm')
      setRules([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  const filteredRules = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()
    if (!keyword) return rules
    return rules.filter((rule) => {
      const title = String(rule?.title || '').toLowerCase()
      const description = String(rule?.description || '').toLowerCase()
      return title.includes(keyword) || description.includes(keyword)
    })
  }, [rules, searchTerm])

  return {
    rules,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    filteredRules,
    fetchRules,
  }
}
