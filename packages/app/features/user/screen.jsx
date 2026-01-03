'use client'

import React, { useMemo, useTransition, lazy, Suspense } from 'react'
import { View } from 'react-native'
import { Spin } from 'antd'
import { useRouter, useSearchParams } from 'solito/navigation'

// Lazy load components với React.lazy
const LazyProfile = lazy(() => import('./screens/Profile'))
const LazyDetail = lazy(() => import('./screens/Detail'))
const LazyPaymentHistory = lazy(() => import('./screens/PaymentHistory'))

const LoadingFallback = () => <Spin />

export function UserScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tab = searchParams?.get('tab')
  const [isPending, startTransition] = useTransition()

  // Memoize screens để tránh tạo lại components mỗi lần render
  const screens = useMemo(
    () => ({
      profile: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyProfile />
        </Suspense>
      ),
      detail: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyDetail />
        </Suspense>
      ),
      history: (
        <Suspense fallback={<LoadingFallback />}>
          <LazyPaymentHistory />
        </Suspense>
      ),
    }),
    [],
  )

  const handleNavigate = (key) => {
    // Sử dụng startTransition để navigation không block UI
    startTransition(() => {
      if (key === 'profile') {
        router.push('/user-profile')
      } else {
        router.push(`/user-profile?tab=${key}`)
      }
    })
  }

  // Default to profile if no tab specified
  const normalizedTab = tab || 'profile'

  // Render screen based on tab
  const currentScreen = screens[normalizedTab] || screens.profile

  return (
    <View style={{ flex: 1 }}>
      {currentScreen}
    </View>
  )
}

export default UserScreen

