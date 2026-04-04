// Wrapper cho solito/navigation trên web: dùng react-router-dom thay vì Next.js router
import {
  useNavigate as useNavigateRR,
  useSearchParams as useSearchParamsRR,
  useParams as useParamsRR,
  useLocation as useLocationRR,
} from 'react-router-dom'

// Tạo useRouter hook tương thích với solito
export function useRouter() {
  const navigate = useNavigateRR()
  const [searchParams] = useSearchParamsRR()
  const location = useLocationRR()

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
    pathname: location.pathname,
    query: Object.fromEntries(searchParams.entries()),
    asPath: location.pathname + location.search,
  }
}

// usePathname hook
export function usePathname() {
  const location = useLocationRR()
  return location.pathname
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

