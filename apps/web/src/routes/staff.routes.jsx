import React from 'react'
import { Route } from 'react-router-dom'

import { StaffScreen } from '@tokki/app/features/back-office/screens/staff-screen'
import { StaffUserDetailScreen } from '@tokki/app/features/user/screens/staff/user-detail-screen'
import { LessonDetailScreen } from '@tokki/app/features/admin/screens/LessonDetail'
import { ExamTemplateDetailScreen } from '@tokki/app/features/examination-management/screens/admin/exam-template-detail-screen'
import { CreateQuestionScreen } from '@tokki/app/features/examination-management/screens/admin/create-question-screen'
import { ViewBlogScreen } from '@tokki/app/features/blog/screens/admin/view-blog-screen'
import { EditBlogScreen } from '@tokki/app/features/blog/screens/admin/edit-blog-screen'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocab-topic-detail-screen'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/admin/vocabulary-detail-screen'
import { QuestionTypeDetailScreen } from '@tokki/app/features/examination-management/components/admin/question-type-management/QuestionTypeDetail'
import { QuestionTypeManagement } from '@tokki/app/features/examination-management/screens/admin/question-type-management-screen'

/**
 * Staff Routes - Container Components
 */
function StaffRoute() {
  return <StaffScreen />
}

/**
 * Staff Routes Configuration
 */
export const staffRoutes = [
  // Staff Dashboard
  { path: '/staff', element: <StaffRoute /> },

  // Staff - User Management
  { path: '/staff/users/:id', element: <StaffUserDetailScreen /> },

  // Staff - Content Management
  { path: '/staff/vocab-topic/:id', element: <FlashcardTopicDetailScreen /> },
  { path: '/staff/lessons/:id', element: <LessonDetailScreen /> },
  { path: '/staff/blog/:id/edit', element: <EditBlogScreen /> },
  { path: '/staff/blog/:id', element: <ViewBlogScreen /> },
  { path: '/staff/vocab/:id', element: <VocabularyDetailScreen /> },
  // Staff - Question Type / Question Bank detail
  { path: '/staff/question-type/:id', element: <QuestionTypeDetailScreen /> },
  { path: '/staff/question-type', element: <QuestionTypeManagement /> },
  // Staff - Exam Templates detail (dùng lại màn admin)
  { path: '/staff/exam-templates/:id', element: <ExamTemplateDetailScreen /> },
  { path: '/staff/question-type/:id', element: <QuestionTypeDetailScreen basePath="/staff" layout="staff" /> },
  { path: '/staff/question-type', element: <QuestionTypeManagement basePath="/staff" /> },
  { path: '/staff/question-bank/create', element: <CreateQuestionScreen basePath="/staff" layout="staff" /> },
]

/**
 * Render Staff Routes
 */
export function renderStaffRoutes() {
  return staffRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
