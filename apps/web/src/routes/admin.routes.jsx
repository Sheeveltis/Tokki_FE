import React from 'react'
import { Route } from 'react-router-dom'

import { AdminScreen } from '@tokki/app/features/admin/screen'
import { CreateLessonScreen } from '@tokki/app/features/admin/screens/CreateLesson'
import { LessonDetailScreen } from '@tokki/app/features/admin/screens/LessonDetail'
import { CreateBlogScreen } from '@tokki/app/features/blog/screens/admin/create-blog-screen'
import { ViewBlogScreen } from '@tokki/app/features/blog/screens/admin/view-blog-screen'
import { EditBlogScreen } from '@tokki/app/features/blog/screens/admin/edit-blog-screen'
import { UserDetailScreen } from '@tokki/app/features/user/screens/UserDetail'
import { CreateUserScreen } from '@tokki/app/features/user/screens/CreateUser'
import { CreateAdminStaffScreen } from '@tokki/app/features/user/screens/CreateAdminStaff'
import { CreateQuestionScreen } from '@tokki/app/features/admin/screens/CreateQuestion'
import { QuestionTypeManagement } from '@tokki/app/features/admin/screens/QuestionType'
import { QuestionTypeDetailScreen } from '@tokki/app/features/admin/screens/QuestionType/components/QuestionTypeDetail'
import { PassageManagementScreen } from '@tokki/app/features/admin/screens/PassageManagement'
import { ExamTemplateDetailScreen } from '@tokki/app/features/admin/screens/ExamTemplateManagement/ExamTemplateDetail'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/FlashcardTopicDetail'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/VocabularyDetail'
import { CreateVocabularyScreen } from '@tokki/app/features/vocabulary/screens/CreateVocabulary'

/**
 * Admin Routes - Container Components
 */
function AdminRoute() {
  return <AdminScreen />
}

/**
 * Admin Routes Configuration
 * Organized by feature modules
 */
export const adminRoutes = [
  // Admin Dashboard
  { path: '/admin', element: <AdminRoute /> },

  // Admin - Lessons Module
  { path: '/admin/lessons/create', element: <CreateLessonScreen /> },
  { path: '/admin/lessons/:id', element: <LessonDetailScreen /> },

  // Admin - Blog Module
  { path: '/admin/blog/create', element: <CreateBlogScreen /> },
  { path: '/admin/blog/:id/edit', element: <EditBlogScreen /> },
  { path: '/admin/blog/:id', element: <ViewBlogScreen /> },

  // Admin - Users Module
  { path: '/admin/users/create', element: <CreateUserScreen /> },
  { path: '/admin/users/create-admin-staff', element: <CreateAdminStaffScreen /> },
  { path: '/admin/users/:id', element: <UserDetailScreen /> },

  // Admin - Question Bank Module
  // Entry: go to QuestionType list first
  { path: '/admin/question-bank', element: <QuestionTypeManagement /> },
  { path: '/admin/question-bank/create', element: <CreateQuestionScreen /> },

  // Admin - Question Type Module
  { path: '/admin/question-type', element: <QuestionTypeManagement /> },
  { path: '/admin/question-type/:id', element: <QuestionTypeDetailScreen /> },

  // Admin - Passage Module
  { path: '/admin/passage', element: <PassageManagementScreen /> },

  // Admin - Vocabulary Module
  { path: '/admin/vocab-topic/:id', element: <FlashcardTopicDetailScreen /> },
  { path: '/admin/vocab/create', element: <CreateVocabularyScreen /> },
  { path: '/admin/vocab/:id', element: <VocabularyDetailScreen /> },

  // Admin - Exam Templates Module
  { path: '/admin/exam-templates/:id', element: <ExamTemplateDetailScreen /> },
]

/**
 * Render Admin Routes
 */
export function renderAdminRoutes() {
  return adminRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
