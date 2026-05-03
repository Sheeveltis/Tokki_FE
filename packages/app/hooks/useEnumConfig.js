import { useState, useEffect } from 'react'
import { apiClient } from '@tokki/app/provider/api/client'
import { ENDPOINTS } from '@tokki/app/provider/api/endpoints'

/**
 * Hook dùng chung để lấy danh sách Enum theo groupCode.
 * 
 * @param {number|string} groupCode - EnumGroup cần lấy (ví dụ: 1)
 * @param {number} pageNumber - Trang hiện tại (mặc định: 1)
 * @param {number} pageSize - Số lượng mỗi trang (mặc định: 100)
 * @returns {{ data: Array, loading: boolean, error: string, pagination: Object }}
 */
export function useEnumConfig(groupCode, pageNumber = 1, pageSize = 100) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 100,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })

  useEffect(() => {
    if (groupCode === undefined || groupCode === null) return

    const fetchEnumConfig = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(ENDPOINTS.ENUMS.LOOKUP(groupCode), {
          params: { pageNumber, pageSize },
        })

        if (response?.data?.isSuccess) {
          setData(response.data.data.items || [])
          setPagination({
            pageNumber: response.data.data.pageNumber,
            pageSize: response.data.data.pageSize,
            totalCount: response.data.data.totalCount,
            totalPages: response.data.data.totalPages,
            hasNextPage: response.data.data.hasNextPage,
            hasPreviousPage: response.data.data.hasPreviousPage,
          })
        } else {
          setError(response?.data?.message || 'Lỗi khi tải dữ liệu enum')
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu enum')
      } finally {
        setLoading(false)
      }
    }

    fetchEnumConfig()
  }, [groupCode, pageNumber, pageSize])

  return { data, loading, error, pagination }
}
