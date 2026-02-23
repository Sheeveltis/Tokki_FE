import './App.css'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'

import { Provider as AppProvider } from '@tokki/app/provider'
import { QueryProvider } from '@tokki/app/provider/query/query-client'

import { AppRoutes } from './routes'


function App() {
  return (
    <QueryProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
          <SpeedInsights />
        </BrowserRouter>
      </AppProvider>
    </QueryProvider>
  )
}

export default App
