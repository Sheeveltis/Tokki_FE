import React, { useMemo, useTransition, lazy, Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { AdminLayout } from '../components/admin/admin-layout.web'
import { clearAuthToken, getAuthToken, getCurrentUserRole } from '../../../provider/api/client.js'

// Lazy load components với React.lazy (thay thế next/dynamic)
const LazyUserManagement = lazy(() => import('../../user/screens/admin/user-management-screen'))
const LazyLessonManagement = lazy(() => import('../../examination-management/screens/admin/lesson-management-screen'))
const LazyVocabularyManagement = lazy(() => import('../../vocabulary/screens/admin/vocabulary-management-screen'))
const LazyFlashcardTopicManagement = lazy(() => import('../../vocabulary/screens/admin/vocab-topic-management-screen'))
const LazyBlogManagement = lazy(() => import('../../blog/screens/admin/blog-management-screen'))
const LazyChatSupport = lazy(() => import('../../customer-service-management/screens/chat-support-screen'))
const LazyAutoEmail = lazy(() => import('../../customer-service-management/screens/auto-email-screen'))
const LazyFeedbackInbox = lazy(() => import('../../customer-service-management/screens/feedback-inbox-screen'))
const LazyMembershipPackage = lazy(() => import('../../revenue-management/screens/membership-package-screen'))
const LazyPaymentManagement = lazy(() => import('../../revenue-management/screens/payment-management'))
const LazyRevenueReport = lazy(() => import('../../revenue-management/screens/revenue-report-screen'))
const LazySystemLog = lazy(() => import('../../system/screens/system-log'))
const LazyAIStatisticsReport = lazy(() => import('../../system/screens/ai_statistics-report-screen'))
const LazySettings = lazy(() => import('../../system/screens/setting-screen'))
const LazyExamTemplateManagement = lazy(() => import('../../examination-management/screens/admin/exam-template-management-screen'))
const LazyExamManagement = lazy(() => import('../../examination-management/screens/admin/exam-management-screen'))
const LazyManualEmail = lazy(() => import('../../customer-service-management/screens/manual-email-screen'))
const LazyQuestionTypeManagement = lazy(() => import('../../examination-management/screens/admin/question-type-management-screen'))
const LazyPassageManagement = lazy(() => import('../../examination-management/screens/admin/passage-management-screen'))
const LazyTitleManagement = lazy(() => import('../../general/components/title-management/title-management-screen'))

const LoadingFallback = () => <Spin />

export function AdminScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Role được phép truy cập admin panel - chỉ Admin
  const allowedRole = 'Admin'

  // Kiểm tra authentication và role khi component mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = getAuthToken()
        
        // Kiểm tra token trước
        if (!token || token === 'null' || token === 'undefined') {
          // Chưa đăng nhập hoặc token không hợp lệ
          setIsAuthorized(false)
          setChecking(false)
          return
        }

        // Kiểm tra role - chỉ Admin mới được truy cập
        const role = getCurrentUserRole()
        
        // Nếu không có role hoặc role không phải Admin
        if (!role || role !== allowedRole) {
          // Không có quyền - redirect về dashboard tương ứng với role
          setIsAuthorized(false)
          setChecking(false)
          
          // Nếu là Staff hoặc Moderator, redirect về dashboard của họ
          if (role === 'Staff') {
            if (typeof window !== 'undefined') {
              window.location.href = '/staff?tab=users'
            } else {
              router.push('/staff?tab=users')
            }
          } else if (role === 'Moderator') {
            if (typeof window !== 'undefined') {
              window.location.href = '/moderator?tab=approve-blog'
            } else {
              router.push('/moderator?tab=approve-blog')
            }
          }
          return
        }

        // Đã đăng nhập và có quyền Admin
        setIsAuthorized(true)
        setChecking(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        // Trong trường hợp lỗi, không authorize và hiển thị login form
        setIsAuthorized(false)
        setChecking(false)
      }
    }

    // Đảm bảo window đã sẵn sàng (cho web)
    if (typeof window !== 'undefined') {
      checkAuth()
    } else {
      // SSR hoặc mobile - chạy ngay
      checkAuth()
    }
  }, [router])

  // Memoize screens để tránh tạo lại components mỗi lần render
  // Phải đặt TRƯỚC early return để tuân thủ Rules of Hooks
  const screens = useMemo(
    () => ({
      'users-admin': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement mode="admin" />
        </Suspense>
      ),
      'users-all': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyUserManagement mode="all" />
        </Suspense>
      ),
      'title-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyTitleManagement />
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
      'membership-package': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyMembershipPackage />
        </Suspense>
      ),
      'payment-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyPaymentManagement />
        </Suspense>
      ),
      'manual-email': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyManualEmail />
        </Suspense>
      ),
      'revenue-report': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyRevenueReport />
        </Suspense>
      ),
      'system-log': (
        <Suspense fallback={<LoadingFallback />}>
          <LazySystemLog />
        </Suspense>
      ),
      'ai-statistics': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyAIStatisticsReport />
        </Suspense>
      ),
      settings: (
        <Suspense fallback={<LoadingFallback />}>
          <LazySettings />
        </Suspense>
      ),
      'exam-template': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyExamTemplateManagement />
        </Suspense>
      ),
      'question-bank': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyQuestionTypeManagement />
        </Suspense>
      ),
      'passage-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyPassageManagement />
        </Suspense>
      ),
      'exam-management': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyExamManagement />
        </Suspense>
      ),
    }),
    [],
  )

  const handleNavigate = (key) => {
    // Sử dụng startTransition để navigation không block UI
    startTransition(() => {
      router.push(`/admin?tab=${key}`)
    })
  }

  const normalizedTab = tab === 'vocab' ? 'vocabulary-words' : tab === 'vocab-topics' ? 'vocabulary-topics' : tab

  // Hiển thị loading khi đang kiểm tra
  if (checking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
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

  // Trả về screen tương ứng
  return screens[normalizedTab] || screens['users-all']
}

export default AdminScreen

