// Wrapper cho solito/navigation trên web: dùng react-router-dom thay vì Next.js router
import { useNavigate as useNavigateRR, useSearchParams as useSearchParamsRR, useParams as useParamsRR } from 'react-router-dom'

// Tạo router object tương thích với solito API
export function useRouter() {
  const navigate = useNavigateRR()
  const [searchParams] = useSearchParamsRR()

  return {
    push: (path: string) => {
      navigate(path)
    },
    replace: (path: string) => {
      navigate(path, { replace: true })
    },
    back: () => {
      navigate(-1)
    },
    pathname: window.location.pathname,
    query: Object.fromEntries(searchParams.entries()),
    asPath: window.location.pathname + window.location.search,
  }
}

// useSearchParams: trả về URLSearchParams object (có method .get()) giống Next.js
export function useSearchParams() {
  const [searchParams] = useSearchParamsRR()
  return searchParams
}

// useParams: trả về params object giống Next.js
export function useParams() {
  return useParamsRR()
}

