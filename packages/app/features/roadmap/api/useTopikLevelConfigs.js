import { useState, useEffect } from 'react'
import { apiClient } from '@tokki/app/provider/api/client'
import { ENDPOINTS } from '@tokki/app/provider/api/endpoints'

export function useTopikLevelConfigs(pageNumber = 1, pageSize = 100) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(ENDPOINTS.TOPIK_LEVEL_CONFIG.GET_ALL(pageNumber, pageSize))
        if (response.data.isSuccess) {
          setData(response.data.data.items)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [pageNumber, pageSize])

  return { data, loading, error }
}
