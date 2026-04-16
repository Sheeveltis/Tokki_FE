import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { renderAuthRoutes } from './auth.routes'
import { renderStudyRoutes } from './study.routes'
import { renderAdminRoutes } from './admin.routes'
import { renderStaffRoutes } from './staff.routes'
import { renderModeratorRoutes } from './moderator.routes'
import { renderPublicRouteItems, PublicLayout } from './public.routes'
import { TestLayout } from '../test-layout'
import { ErrorScreen } from '@tokki/app/features/general/screens/error-screen'

/**
 * App Routes - Centralized Route Configuration
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Root Layout for persistent navigation across Public and Study core features */}
      <Route element={<PublicLayout />}>
        {renderPublicRouteItems()}
        {renderStudyRoutes()}
      </Route>

      {/* Authentication Routes */}
      {renderAuthRoutes()}

      {/* Staff Routes */}
      {renderStaffRoutes()}

      {/* Moderator Routes */}
      {renderModeratorRoutes()}

      {/* Admin Routes */}
      {renderAdminRoutes()}

      {/* Development/Test Routes */}
      <Route path="/test-layout" element={<TestLayout />} />

      {/* Catch-all route for 404 - Must be last */}
      <Route path="*" element={<ErrorScreen />} />
    </Routes>
  )
}
