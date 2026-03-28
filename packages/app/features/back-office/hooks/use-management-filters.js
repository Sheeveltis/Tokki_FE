import { useState, useCallback } from 'react'
import { useSearchParams } from 'solito/navigation'

/**
 * Hook to manage management list filters with URL synchronization.
 * Helps preserve pagination and search state when navigating back.
 * 
 * @param {Object} initialValues - Default values for filters
 * @returns {[Object, Function]} - [filters, setFilters]
 */
export function useManagementFilters(initialValues) {
  const searchParams = useSearchParams()
  
  // Initialize from searchParams OR initialValues
  const [filters, setFiltersState] = useState(() => {
    const params = { ...initialValues }
    
    // Duyệt qua tất cả keys trong initialValues để lấy giá trị từ URL nếu có
    Object.keys(initialValues).forEach(key => {
      const val = searchParams?.get(key)
      if (val !== null && val !== undefined) {
        // Chuyển đổi kiểu dữ liệu cơ bản (số)
        if (!isNaN(val) && val.trim() !== '' && typeof initialValues[key] === 'number') {
          params[key] = Number(val)
        } else if (val === 'null') {
          params[key] = null
        } else {
          params[key] = val
        }
      }
    })
    
    return params
  })

  // Đồng bộ với URL (sử dụng replaceState để không làm bẩn history)
  const syncWithUrl = useCallback((nextFilters) => {
    if (typeof window === 'undefined') return
    
    try {
      const url = new URL(window.location.href)
      Object.keys(nextFilters).forEach(key => {
        const val = nextFilters[key]
        if (val === null || val === undefined || val === '') {
          // Chỉ xóa nếu nó không phải là search mặc định (tránh mất các params khác như tab)
          if (key !== 'tab') url.searchParams.delete(key)
        } else {
          url.searchParams.set(key, val)
        }
      })
      
      // Cập nhật URL mà không reload trang
      window.history.replaceState(null, '', url.toString())
    } catch (e) {
      console.warn('Failed to sync filters with URL:', e)
    }
  }, [])

  const setFilters = useCallback((update) => {
    setFiltersState(prev => {
      const next = typeof update === 'function' ? update(prev) : { ...prev, ...update }
      syncWithUrl(next)
      return next
    })
  }, [syncWithUrl])

  return [filters, setFilters]
}
