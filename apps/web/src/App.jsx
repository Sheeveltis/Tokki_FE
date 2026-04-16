import './App.css'
import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { SpeedInsights } from '@vercel/speed-insights/react'

const showSpeedInsights = import.meta.env.PROD

import { Provider as AppProvider } from '@tokki/app/provider'
import { QueryProvider } from '@tokki/app/provider/query/query-client'

import { AppRoutes } from './routes'
import { PageTitle } from './routes/utils/PageTitle'

function App() {
  return (
    <QueryProvider>
      <AppProvider>
        <BrowserRouter>
          <PageTitle />
          <AppRoutes />
          {showSpeedInsights ? <SpeedInsights /> : null}
        </BrowserRouter>
      </AppProvider>
    </QueryProvider>
  )
}

export default App
