'use client'

import React, { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { getPaymentHistory } from './api/api'
import { PaymentHistoryLayout as PaymentHistoryLayoutWeb } from './components/payment-history-layout.web'
import { PaymentHistoryLayout as PaymentHistoryLayoutNative } from './components/payment-history-layout.native'

/**
 * Payment History Screen
 * - Main entry point for payment history
 * - Uses platform-specific layout
 */
export function PaymentHistoryScreen() {
  const router = useRouter()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getPaymentHistory()
        setPayments(data || [])
      } catch (err) {
        console.error('[PaymentHistoryScreen] Error fetching payment history:', err)
        setError(err.message || 'Không thể tải lịch sử thanh toán')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  const handleActionPress = (key) => {
    if (key === 'profile') {
      router.push('/user-profile')
    } else if (key === 'history') {
      router.push('/user-profile?tab=history')
    } else if (key === 'roadmap') {
      router.push('/roadmap')
    } else if (key === 'logout') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      router.push('/login')
    }
  }

  const LayoutComponent = Platform.select({
    web: PaymentHistoryLayoutWeb,
    default: PaymentHistoryLayoutNative,
  })

  return (
    <LayoutComponent 
      payments={payments} 
      loading={loading} 
      error={error}
      onActionPress={handleActionPress}
    />
  )
}

export default PaymentHistoryScreen

