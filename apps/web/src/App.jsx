import './App.css'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { Provider as AppProvider } from '@tokki/app/provider'
import { QueryProvider } from '@tokki/app/provider/query/query-client'

import { AppRoutes } from './routes'

/**
 * App Component - Main Application Entry Point
 * 
 * Refactored to use modular route architecture:
 * - Route Grouping / Route Modularization
 * - Wrapper / Container Pattern
 * - Logic Abstraction
 * - Code Cleanup & Organization
 */
function App() {
  return (
    <QueryProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </QueryProvider>
  )
}

export default App
