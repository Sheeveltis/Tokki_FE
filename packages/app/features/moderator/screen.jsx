'use client'

import React, { useMemo, useTransition, lazy, Suspense } from 'react'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'
import { ModeratorLayout } from './components/moderator-layout.web'

// Lazy load các màn duyệt, tái sử dụng từ admin / vocabulary / blog
const LazyBlogManagement = lazy(() => import('../blog/blog-management'))
const LazyVocabularyManagement = lazy(() => import('../vocabulary/screens/VocabularyManagement'))
const LazyExamTemplateManagement = lazy(() => import('../admin/screens/ExamTemplateManagement'))
const LazyExamManagement = lazy(() => import('../admin/screens/ExamManagement'))

const LoadingFallback = () => <Spin />

export function ModeratorScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  // Chỉ chứa các màn duyệt: blog, từ vựng, cấu trúc đề, đề
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

  return (
    <ModeratorLayout
      screens={screens}
      defaultKey={normalizedTab}
      onNavigate={handleNavigate}
      onLogout={() => {
        console.log('Moderator logout')
        router.push('/login')
      }}
    />
  )
}

export default ModeratorScreen


