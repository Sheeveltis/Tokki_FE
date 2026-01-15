import React from 'react'
import { Route } from 'react-router-dom'

import { StaffScreen } from '@tokki/app/features/staff/screen'
import { StaffUserDetailScreen } from '@tokki/app/features/staff/screens/UserDetail'
import { LessonDetailScreen } from '@tokki/app/features/admin/screens/LessonDetail'
import { ViewBlogScreen } from '@tokki/app/features/blog/screens/admin/view-blog-screen'
import { EditBlogScreen } from '@tokki/app/features/blog/screens/admin/edit-blog-screen'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/FlashcardTopicDetail'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/VocabularyDetail'
import { QuestionTypeDetailScreen } from '@tokki/app/features/admin/screens/QuestionType/components/QuestionTypeDetail'
import { QuestionTypeManagement } from '@tokki/app/features/admin/screens/QuestionType'

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
]

/**
 * Render Staff Routes
 */
export function renderStaffRoutes() {
  return staffRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
