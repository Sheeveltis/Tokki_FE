import React from 'react'
import { Route } from 'react-router-dom'

import { StaffScreen } from '@tokki/app/features/back-office/screens/staff-screen'
import { StaffUserDetailScreen } from '@tokki/app/features/user/screens/staff/user-detail-screen'
import { LessonDetailScreen } from '@tokki/app/features/examination-management/screens/admin/lesson-detail-screen'
import { ExamTemplateDetailScreen } from '@tokki/app/features/examination-management/screens/admin/exam-template-detail-screen'
import { CreateQuestionScreen } from '@tokki/app/features/examination-management/screens/admin/create-question-screen'
import { ViewBlogScreen } from '@tokki/app/features/blog/screens/admin/view-blog-screen'
import { EditBlogScreen } from '@tokki/app/features/blog/screens/admin/edit-blog-screen'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocab-topic-detail-screen'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocabulary-detail-screen'
import { CreateVocabularyScreen } from '@tokki/app/features/vocabulary/screens/admin/create-vocabulary-screen'
import { QuestionTypeDetailScreen } from '@tokki/app/features/examination-management/components/admin/question-type-management/QuestionTypeDetail'
import { QuestionTypeManagement } from '@tokki/app/features/examination-management/screens/admin/question-type-management-screen'

import { Outlet } from 'react-router-dom'
import { StaffLayout } from '@tokki/app/features/back-office/components/staff/staff-layout.web'
import { useRouter } from 'solito/navigation'
import { clearAuthToken } from '@tokki/app/provider/api/client'

/**
 * Staff Routes - Persistence Wrapper
 */
function StaffLayoutWrapper() {
  const router = useRouter()
  return (
    <StaffLayout 
      onLogout={async () => {
        await clearAuthToken()
        router.push('/admin-login')
      }}
      onNavigate={(key) => router.push(`/staff?tab=${key}`)}
    >
      <Outlet />
    </StaffLayout>
  )
}

/**
 * Staff Routes Configuration
 */
export const staffRoutes = [
  {
    path: '/staff',
    element: <StaffLayoutWrapper />,
    children: [
      { index: true, element: <StaffScreen /> },
      
      // Staff - User Management
      { path: 'users/:id', element: <StaffUserDetailScreen /> },

      // Staff - Content Management
      { path: 'vocab-topic/:id', element: <FlashcardTopicDetailScreen /> },
      { path: 'lessons/:id', element: <LessonDetailScreen /> },
      { path: 'blog/:id/edit', element: <EditBlogScreen /> },
      { path: 'blog/:id', element: <ViewBlogScreen /> },
      { path: 'vocab/:id', element: <VocabularyDetailScreen /> },
      { path: 'vocab/create', element: <CreateVocabularyScreen /> },
      
      // Staff - Question Type / Question Bank detail
      { path: 'question-type/:id', element: <QuestionTypeDetailScreen basePath="/staff" layout="staff" /> },
      { path: 'question-type', element: <QuestionTypeManagement basePath="/staff" /> },
      { path: 'exam-templates/:id', element: <ExamTemplateDetailScreen /> },
      { path: 'question-bank/create', element: <CreateQuestionScreen basePath="/staff" layout="staff" /> },
    ]
  }
]

/**
 * Render Staff Routes
 */
export function renderStaffRoutes() {
  return staffRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element}>
      {route.children?.map(child => (
        <Route 
          key={child.path || 'index'} 
          index={child.index} 
          path={child.path} 
          element={child.element} 
        />
      ))}
    </Route>
  ))
}
