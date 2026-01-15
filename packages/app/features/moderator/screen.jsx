'use client'

import React, { useMemo, useTransition, lazy, Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { ModeratorLayout } from './components/moderator-layout.web'
import { clearAuthToken, getAuthToken, getCurrentUserRole } from '../../provider/api/client'
import { AdminLoginForm } from '../authentication/components/admin-login/admin-login-form'

// Lazy load các màn duyệt, tái sử dụng từ admin / vocabulary / blog
const LazyBlogManagement = lazy(() => import('../blog/screens/admin/blog-management-screen'))
const LazyVocabularyManagement = lazy(() => import('../vocabulary/screens/VocabularyManagement'))
const LazyFlashcardTopicManagement = lazy(() => import('../vocabulary/screens/FlashcardTopicManagement'))
const LazyExamTemplateManagement = lazy(() => import('../admin/screens/ExamTemplateManagement'))
const LazyExamManagement = lazy(() => import('../admin/screens/ExamManagement'))

const LoadingFallback = () => <Spin />

export function ModeratorScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()
  const [checking, setChecking] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Role được phép truy cập moderator panel
  const allowedRole = 'Moderator'

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

        // Kiểm tra role - chỉ Moderator mới được truy cập
        const role = getCurrentUserRole()
        
        if (!role || role !== allowedRole) {
          // Không có quyền - redirect về dashboard tương ứng với role
          setIsAuthorized(false)
          setChecking(false)
          
          // Nếu là Admin hoặc Staff, redirect về dashboard của họ
          if (role === 'Admin') {
            if (typeof window !== 'undefined') {
              window.location.href = '/admin?tab=users-all'
            } else {
              router.push('/admin?tab=users-all')
            }
          } else if (role === 'Staff') {
            if (typeof window !== 'undefined') {
              window.location.href = '/staff?tab=users'
            } else {
              router.push('/staff?tab=users')
            }
          }
          return
        }

        // Đã đăng nhập và có quyền Moderator
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

  // Chỉ chứa các màn duyệt: blog, từ vựng, chủ đề từ vựng, cấu trúc đề, đề
  const screens = useMemo(
    () => ({
      'approve-blog': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyBlogManagement />
        </Suspense>
      ),
      'approve-vocabulary': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyVocabularyManagement />
        </Suspense>
      ),
      'approve-flashcard-topic': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyFlashcardTopicManagement />
        </Suspense>
      ),
      'approve-exam-template': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyExamTemplateManagement />
        </Suspense>
      ),
      'approve-exam': (
        <Suspense fallback={<LoadingFallback />}>
          <LazyExamManagement />
        </Suspense>
      ),
    }),
    [],
  )

  const handleNavigate = (key) => {
    // Navigation không block UI
    startTransition(() => {
      router.push(`/moderator?tab=${key}`)
    })
  }

  const normalizedTab = tab || 'approve-blog'

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

  // Hiển thị moderator panel nếu đã đăng nhập và có quyền
  return (
    <ModeratorLayout
      screens={screens}
      defaultKey={normalizedTab}
      onNavigate={handleNavigate}
      onLogout={async () => {
        // Xóa token khi đăng xuất
        await clearAuthToken()
        // Dùng window.location.href để đảm bảo redirect hoạt động
        // Redirect về /moderator để hiển thị login form
        if (typeof window !== 'undefined') {
          window.location.href = '/moderator'
        } else {
          router.push('/moderator')
        }
      }}
    />
  )
}

export default ModeratorScreen


