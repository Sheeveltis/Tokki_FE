import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { getPaymentById, getPaymentStatusById } from '../../api/payment-detail-api'
import { ClockCircleOutlined } from '@ant-design/icons'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

export const QRIsepay = ({ paymentId, paymentUrl, style }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const [error, setError] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [expiresAt, setExpiresAt] = useState(null)
  const intervalRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const hasNavigatedRef = useRef(false)
  const hasNavigatedToFailedRef = useRef(false)

  // ... (previous logic stays the same)
  useEffect(() => {
    if (paymentUrl) {
      setQrUrl(paymentUrl)
      return
    }
    if (paymentId) {
      fetchQRCode()
    }
  }, [paymentId, paymentUrl])

  useEffect(() => {
    if (!expiresAt) return
    
    const updateTimer = () => {
      const now = new Date()
      const expiry = new Date(expiresAt)
      const diff = Math.floor((expiry.getTime() - now.getTime()) / 1000)

      if (diff <= 0) {
        setTimeLeft(0)
        if (!hasNavigatedToFailedRef.current && !hasNavigatedRef.current) {
          hasNavigatedToFailedRef.current = true
          if (intervalRef.current) clearInterval(intervalRef.current)
          router.push('/payment-failed')
        }
      } else {
        setTimeLeft(diff)
      }
    }

    updateTimer()
    timerIntervalRef.current = setInterval(updateTimer, 1000)
    
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [expiresAt, router])

  useEffect(() => {
    if (!paymentId) return
    const checkPaymentStatus = async () => {
      try {
        const response = await getPaymentStatusById(paymentId)
        if (response.isSuccess && response.data) {
          // Lưu thời gian hết hạn để tính toán countdown
          if (response.data.expiresAt) {
            setExpiresAt(response.data.expiresAt)
          }

          const status = response.data.status
          if (status === 1 && !hasNavigatedRef.current && !hasNavigatedToFailedRef.current) {
            hasNavigatedRef.current = true
            if (intervalRef.current) clearInterval(intervalRef.current)
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
            if (Platform.OS === 'web') {
              sessionStorage.setItem('payment_success', 'true')
            }
            router.push('/payment-success')
          }
        }
      } catch (error) {
        const errorMessage = error?.response?.data?.message || error?.message || ''
        if (errorMessage.includes('hết hạn') || errorMessage.includes('đăng nhập') || error?.response?.status === 401) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return
        }
        console.error('Error checking payment status:', error)
      }
    }
    checkPaymentStatus()
    intervalRef.current = setInterval(checkPaymentStatus, 2000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paymentId, router])

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const fetchQRCode = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getPaymentById(paymentId)
      if (response.isSuccess && response.data) {
        setQrUrl(response.data)
      } else {
        setError('Không thể lấy mã QR thanh toán')
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi lấy mã QR')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Quét mã QR để thanh toán</Text>
      <Text style={styles.instruction}>
        Sử dụng ứng dụng ngân hàng bất kỳ để quét mã QR và chuyển tiền tự động
      </Text>

      <View style={styles.qrWrapper}>
        <View style={styles.qrContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#FFB703" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : qrUrl ? (
            <Image
              source={normalizeImageSource(qrUrl)}
              style={styles.qrCode}
              resizeMode="contain"
            />
          ) : (
            <Text style={styles.placeholderText}>Đang khởi tạo mã QR...</Text>
          )}
        </View>
      </View>

      {qrUrl && !error && (
        <View style={styles.timerWrapper}>
          <ClockCircleOutlined style={{ fontSize: 16, color: '#666', marginRight: 8 }} />
          <Text style={styles.timerLabel}>Thời gian còn lại: </Text>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 12,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 400,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#F8F9FB',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E8EBF1',
  },
  qrContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  timerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#FFF0F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  timerLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF4D6D',
    fontFamily: 'Lexend, sans-serif',
  },
  errorText: {
    color: '#FF4D6D',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
  },
})

