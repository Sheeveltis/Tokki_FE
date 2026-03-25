import React from 'react'
import { Route } from 'react-router-dom'

import { AdminScreen } from '@tokki/app/features/back-office/screens/admin-screen'
import { CreateLessonScreen } from '@tokki/app/features/admin/screens/CreateLesson'
import { LessonDetailScreen } from '@tokki/app/features/examination-management/screens/admin/lesson-detail-screen'
import { CreateBlogScreen } from '@tokki/app/features/blog/screens/admin/create-blog-screen'
import { ViewBlogScreen } from '@tokki/app/features/blog/screens/admin/view-blog-screen'
import { EditBlogScreen } from '@tokki/app/features/blog/screens/admin/edit-blog-screen'
import { UserDetailScreen } from '@tokki/app/features/user/screens/admin/user-detail-screen'
import { CreateUserScreen } from '@tokki/app/features/user/screens/admin/create-user-screen'
import { CreateAdminStaffScreen } from '@tokki/app/features/user/screens/admin/create-admin-staff-screen'
import { CreateQuestionScreen } from '@tokki/app/features/examination-management/screens/admin/create-question-screen'
import { QuestionTypeManagement } from '@tokki/app/features/examination-management/screens/admin/question-type-management-screen'
import { QuestionTypeDetailScreen } from '@tokki/app/features/examination-management/components/admin/question-type-management/QuestionTypeDetail'
import { PassageManagementScreen } from '@tokki/app/features/examination-management/screens/admin/passage-management-screen'
import { ExamTemplateDetailScreen } from '@tokki/app/features/examination-management/screens/admin/exam-template-detail-screen'
import { ExamDetailScreen } from '@tokki/app/features/examination-management/screens/admin/exam-detail-screen'
import { CreateExamScreen } from '@tokki/app/features/examination-management/screens/admin/create-exam-screen'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocab-topic-detail-screen'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocabulary-detail-screen'
import { CreateVocabularyScreen } from '@tokki/app/features/vocabulary/screens/admin/create-vocabulary-screen'

import { Outlet } from 'react-router-dom'
import { AdminLayout } from '@tokki/app/features/back-office/components/admin/admin-layout.web'
import { useRouter } from 'solito/navigation'
import { clearAuthToken } from '@tokki/app/provider/api/client'

/**
 * Admin Routes - Persistence Wrapper
 */
function AdminLayoutWrapper() {
  const router = useRouter()
  return (
    <AdminLayout 
      onLogout={async () => {
        await clearAuthToken()
        router.push('/admin-login')
      }}
      onNavigate={(key) => router.push(`/admin?tab=${key}`)}
    >
      <Outlet />
    </AdminLayout>
  )
}

/**
 * Admin Routes Configuration
 */
export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayoutWrapper />,
    children: [
      { index: true, element: <AdminScreen /> },
      
      // Admin - Lessons Module
      { path: 'lessons/create', element: <CreateLessonScreen /> },
      { path: 'lessons/:id', element: <LessonDetailScreen /> },

      // Admin - Blog Module
      { path: 'blog/create', element: <CreateBlogScreen /> },
      { path: 'blog/:id/edit', element: <EditBlogScreen /> },
      { path: 'blog/:id', element: <ViewBlogScreen /> },

      // Admin - Users Module
      { path: 'users/create', element: <CreateUserScreen /> },
      { path: 'users/create-admin-staff', element: <CreateAdminStaffScreen /> },
      { path: 'users/:id', element: <UserDetailScreen /> },

      // Admin - Question Bank Module (QuestionType)
      { path: 'question-bank', element: <QuestionTypeManagement /> },
      { path: 'question-bank/create', element: <CreateQuestionScreen /> },
      { path: 'question-type', element: <QuestionTypeManagement /> },
      { path: 'question-type/:id', element: <QuestionTypeDetailScreen /> },

      // Admin - Passage Module
      { path: 'passage', element: <PassageManagementScreen /> },

      // Admin - Vocabulary Module
      { path: 'vocab-topic/:id', element: <FlashcardTopicDetailScreen /> },
      { path: 'vocab/create', element: <CreateVocabularyScreen /> },
      { path: 'vocab/:id', element: <VocabularyDetailScreen /> },

      // Admin - Exam Templates Module
      { path: 'exam-templates/:id', element: <ExamTemplateDetailScreen /> },

      // Admin - Exams Module
      { path: 'exams/create', element: <CreateExamScreen /> },
      { path: 'exams/:id', element: <ExamDetailScreen /> },
    ]
  }
]

/**
 * Render Admin Routes
 */
export function renderAdminRoutes() {
  return adminRoutes.map((route) => (
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
