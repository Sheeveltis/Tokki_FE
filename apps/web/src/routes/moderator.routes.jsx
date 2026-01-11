import React from 'react'
import { Route } from 'react-router-dom'

import { ModeratorScreen } from '@tokki/app/features/moderator/screen'
import { BlogDetailScreen as AdminBlogDetailScreen } from '@tokki/app/features/admin/screens/BlogDetail'
import { FlashcardTopicDetailScreen } from '@tokki/app/features/vocabulary/screens/FlashcardTopicDetail'
import { VocabularyDetailScreen } from '@tokki/app/features/vocabulary/screens/VocabularyDetail'

/**
 * Moderator Routes - Container Components
 */
function ModeratorRoute() {
  return <ModeratorScreen />
}

/**
 * Moderator Routes Configuration
 */
export const moderatorRoutes = [
  // Moderator Dashboard
  { path: '/moderator', element: <ModeratorRoute /> },

  // Moderator - Content Review
  { path: '/moderator/vocab-topic/:id', element: <FlashcardTopicDetailScreen /> },
  { path: '/moderator/blog/:id', element: <AdminBlogDetailScreen /> },
  { path: '/moderator/vocab/:id', element: <VocabularyDetailScreen /> },
]

/**
 * Render Moderator Routes
 */
export function renderModeratorRoutes() {
  return moderatorRoutes.map((route) => (
    <Route key={route.path} path={route.path} element={route.element} />
  ))
}
