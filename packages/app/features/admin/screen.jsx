'use client'

import React, { useMemo, useTransition, lazy, Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { AdminLayout } from './components/admin-layout.web'
import { clearAuthToken, getAuthToken, getCurrentUserRole } from '../../provider/api/client'
import { AdminLoginForm } from '../authentication/components/admin-login-form'

// Lazy load components với React.lazy (thay thế next/dynamic)
const LazyUserManagement = lazy(() => import('../user/screens/UserManagement'))
const LazyLessonManagement = lazy(() => import('./screens/LessonManagement'))
const LazyVocabularyManagement = lazy(() => import('../vocabulary/screens/VocabularyManagement'))
const LazyFlashcardTopicManagement = lazy(() => import('../vocabulary/screens/FlashcardTopicManagement'))
const LazyBlogManagement = lazy(() => import('../blog/blog-management'))
const LazyChatSupport = lazy(() => import('../live-chat/chat-support'))
const LazyAutoEmail = lazy(() => import('./screens/AutoEmail'))
const LazyFeedbackInbox = lazy(() => import('./screens/FeedbackInbox'))
const LazyMembershipPackage = lazy(() => import('./screens/MembershipPackage'))
const LazyPaymentManagement = lazy(() => import('./screens/PaymentManagement'))
const LazyRevenueReport = lazy(() => import('./screens/RevenueReport'))
const LazySystemLog = lazy(() => import('./screens/SystemLog'))
const LazyAIStatisticsReport = lazy(() => import('./screens/AIStatisticsReport'))
const LazySettings = lazy(() => import('./screens/Settings'))
const LazyExamTemplateManagement = lazy(() => import('./screens/ExamTemplateManagement'))
const LazyQuestionBankManagement = lazy(() => import('./screens/QuestionBankManagement'))
const LazyExamManagement = lazy(() => import('./screens/ExamManagement'))
const LazyManualEmail = lazy(() => import('./screens/ManualEmail'))

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
        
        if (!token) {
          // Chưa đăng nhập
          setIsAuthorized(false)
          setChecking(false)
          return
        }

        // Kiểm tra role - chỉ Admin mới được truy cập
        const role = getCurrentUserRole()
        
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
        setIsAuthorized(false)
        setChecking(false)
      }
    }

    checkAuth()
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
          <LazyQuestionBankManagement />
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  // Hiển thị login form nếu chưa đăng nhập hoặc không có quyền
  if (!isAuthorized) {
    return <AdminLoginForm />
  }

  // Hiển thị admin panel nếu đã đăng nhập và có quyền
  return (
    <AdminLayout
      screens={screens}
      defaultKey={normalizedTab || 'users-all'}
      onNavigate={handleNavigate}
      onLogout={async () => {
        // Xóa token khi đăng xuất
        await clearAuthToken()
        // Dùng window.location.href để đảm bảo redirect hoạt động
        // Redirect về /admin để hiển thị login form
        if (typeof window !== 'undefined') {
          window.location.href = '/admin'
        } else {
          router.push('/admin')
        }
      }}
    />
  )
}

export default AdminScreen

