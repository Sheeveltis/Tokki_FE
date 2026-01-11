import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { renderAuthRoutes } from './auth.routes'
import { renderStudyRoutes } from './study.routes'
import { renderAdminRoutes } from './admin.routes'
import { renderStaffRoutes } from './staff.routes'
import { renderModeratorRoutes } from './moderator.routes'
import { renderPublicRoutes } from './public.routes'
import { TestLayout } from '../test-layout'
import { ErrorScreen } from '@tokki/app/features/error/error-screen'

/**
 * App Routes - Centralized Route Configuration
 * 
 * This module aggregates all route modules following:
 * - Route Grouping / Route Modularization
 * - Wrapper / Container Pattern
 * - Logic Abstraction
 * - Code Cleanup & Organization
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      {renderPublicRoutes()}

      {/* Authentication Routes */}
      {renderAuthRoutes()}

      {/* Study Routes */}
      {renderStudyRoutes()}

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
