import { useNavigate, useSearchParams, useParams } from 'react-router-dom'

/**
 * Navigation Hook - Abstracts navigation logic
 */
export function useRouteNavigation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const params = useParams()

  return {
    navigate,
    searchParams,
    params,
    getQueryParam: (key, defaultValue = '') => searchParams.get(key) || defaultValue,
    getIntQueryParam: (key, defaultValue = 1) => {
      const value = searchParams.get(key)
      return value ? parseInt(value, 10) : defaultValue
    },
    navigateWithQuery: (path, query = {}) => {
      const queryString = new URLSearchParams(query).toString()
      navigate(`${path}${queryString ? `?${queryString}` : ''}`)
    },
  }
}
