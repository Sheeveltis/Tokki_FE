import React, { useEffect, useState, useMemo, useTransition, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { StaffLayout } from '../components/staff/staff-layout.web'
import { fetchRegularUsers } from '../api/staff-index'
import { getAuthToken, getCurrentUserRole } from '../../../provider/api/client.js'
// Lazy load để giảm bundle + chỉ fetch khi cần tab
const LazyUserManagement = lazy(() => import('../../user/screens/admin/user-management-screen'))
const LazyLessonManagement = lazy(() => import('../../examination-management/screens/admin/lesson-management-screen'))
const LazyVocabularyManagement = lazy(() => import('../../vocabulary/screens/admin/vocabulary-management-screen'))
const LazyFlashcardTopicManagement = lazy(() => import('../../vocabulary/screens/admin/vocab-topic-management-screen'))
const LazyBlogManagement = lazy(() => import('../../blog/screens/admin/blog-management-screen'))
const LazyChatSupport = lazy(() => import('../../customer-service-management/screens/chat-support-screen'))
const LazyAutoEmail = lazy(() => import('../../customer-service-management/screens/auto-email-screen'))
const LazyFeedbackInbox = lazy(() => import('../../customer-service-management/screens/feedback-inbox-screen'))
const LazySettings = lazy(() => import('../../user/screens/staff/setting-screen'))
const LazyQuestionTypeManagement = lazy(() => import('../../examination-management/screens/admin/question-type-management-screen'))
const LazyExamTemplateManagement = lazy(() => import('../../examination-management/screens/admin/exam-template-management-screen'))
const LazyPronunciationManagement = lazy(() => import('../../pronunciation/screens/admin/pronunciation-management-screen'))

// Cache dữ liệu để khi quay lại từ trang chi tiết không phải load lại toàn bộ
let cachedInitialData = null
let cachedAt = 0
const CACHE_TTL_MS = 2 * 60 * 1000 // 2 phút

const LoadingFallback = () => (
  <div
    style={{
      minHeight: '50vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Spin size="large" tip="Đang tải dữ liệu..." />
  </div>
)

export function StaffScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Role được phép truy cập staff panel
  const allowedRole = 'Staff'

  const [bootLoading, setBootLoading] = useState(true)
  const [initialData, setInitialData] = useState({
    users: null,
  })

  // Kiểm tra authentication và role khi component mount
  useEffect(() => {
    let mounted = true

    const checkAuth = () => {
      try {
        const token = getAuthToken()

        // Kiểm tra token trước - bao gồm cả string 'null' và 'undefined'
        if (!token || token === 'null' || token === 'undefined') {
          // Chưa đăng nhập hoặc token không hợp lệ
          if (mounted) {
            setIsAuthorized(false)
            setChecking(false)
          }
          return
        }

        // Kiểm tra role - chỉ Staff mới được truy cập
        const role = getCurrentUserRole()

        // Nếu không có role hoặc role không phải Staff
        if (!role || role !== allowedRole) {
          // Không có quyền - redirect về dashboard tương ứng với role
          if (mounted) {
            setIsAuthorized(false)
            setChecking(false)
          }

          // Nếu là Admin hoặc Moderator, redirect về dashboard của họ
          if (role === 'Admin') {
            if (typeof window !== 'undefined') {
              window.location.href = '/admin?tab=users-all'
            }
          } else if (role === 'Moderator') {
            if (typeof window !== 'undefined') {
              window.location.href = '/moderator?tab=approve-blog'
            }
          }
          return
        }

        // Đã đăng nhập và có quyền Staff
        if (mounted) {
          setIsAuthorized(true)
          setChecking(false)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        // Trong trường hợp lỗi, không authorize và hiển thị login form
        if (mounted) {
          setIsAuthorized(false)
          setChecking(false)
        }
      }
    }

    // Đảm bảo window đã sẵn sàng (cho web)
    if (typeof window !== 'undefined') {
      checkAuth()
    } else {
      // SSR hoặc mobile - chạy ngay
      checkAuth()
    }

    return () => {
      mounted = false
    }
  }, []) // Chỉ chạy một lần khi mount

  useEffect(() => {
    // Chỉ load dữ liệu khi đã authorized
    if (!isAuthorized) {
      setBootLoading(false)
      return
    }

    let mounted = true
    const loadAll = async () => {
      try {
        const now = Date.now()
        if (cachedInitialData && now - cachedAt < CACHE_TTL_MS) {
          if (mounted) {
            setInitialData(cachedInitialData)
            setBootLoading(false)
          }
          return
        }

        const users = await fetchRegularUsers()
        if (mounted) {
          const nextData = { users }
          cachedInitialData = nextData
          cachedAt = now
          setInitialData(nextData)
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu staff:', error.message)
        if (mounted) {
          setInitialData({ users: [] })
        }
      } finally {
        if (mounted) setBootLoading(false)
      }
    }
    loadAll()
    return () => {
      mounted = false
    }
  }, [isAuthorized]) // Chỉ chạy khi isAuthorized thay đổi

  // Memoize screens để tránh tạo lại components mỗi lần render
  const screens = useMemo(
    () => ({
      users: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement
            basePath="/staff"
            mode="all"
            initialData={
              initialData.users
                ? {
                  items: initialData.users,
                  total: initialData.users.length,
                }
                : null
            }
          />
        </Suspense>
      ),
      lessons: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyLessonManagement />
        </Suspense>
      ),
      'vocabulary-words': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyVocabularyManagement />
        </Suspense>
      ),
      'vocabulary-topics': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyFlashcardTopicManagement />
        </Suspense>
      ),
      'question-bank': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyQuestionTypeManagement basePath="/staff" />
        </Suspense>
      ),
      'exam-templates': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyExamTemplateManagement basePath="/staff" />
        </Suspense>
      ),
      blog: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyBlogManagement />
        </Suspense>
      ),
      'chat-support': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyChatSupport />
        </Suspense>
      ),
      'auto-email': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyAutoEmail />
        </Suspense>
      ),
      'feedback-inbox': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyFeedbackInbox />
        </Suspense>
      ),
      'pronunciation-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyPronunciationManagement basePath="/staff" />
        </Suspense>
      ),
      settings: (
        <Suspense fallback={<LoadingFallback />}>
          <LazySettings />
        </Suspense>
      ),
    }),
    [initialData],
  )

  const handleNavigate = (key) => {
    startTransition(() => {
      router.push(`/staff?tab=${key}`)
    })
  }

  // Hiển thị loading khi đang kiểm tra authentication
  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  // Chuyển hướng đến trang login nếu chưa đăng nhập hoặc không có quyền
  if (!isAuthorized) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin-login'
    } else {
      router.push('/admin-login')
    }
    return null
  }

  // Hiển thị loading khi đang tải dữ liệu
  if (bootLoading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    )
  }

  const normalizedTab = 
    (tab === 'vocab'
      ? 'vocabulary-words'
      : tab === 'vocab-topics'
        ? 'vocabulary-topics'
        : tab) || 'users'

  // Trả về screen tương ứng (Layout đã được bọc ở persistent layer trong routes)
  return screens[normalizedTab] || screens['users']
}

export default StaffScreen

