import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native'
import { useRouter } from 'solito/navigation'
import { getPaymentById, getPaymentStatusById } from '../api/api'

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

/**
 * QR ISePay Component
 * - Displays payment QR code from SePay API
 * - Shows instructions and bank logos
 *
 * @param {{
 *   paymentId: string;
 *   style?: any;
 * }} props
 */
export const QRIsepay = ({ paymentId, style }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState(null)
  const [error, setError] = useState(null)
  const intervalRef = useRef(null)
  const hasNavigatedRef = useRef(false)

  useEffect(() => {
    if (paymentId) {
      fetchQRCode()
    }
  }, [paymentId])

  // Poll payment status every 2 seconds
  useEffect(() => {
    if (!paymentId) return

    // Function to check payment status
    const checkPaymentStatus = async () => {
      try {
        const response = await getPaymentStatusById(paymentId)
        
        if (response.isSuccess && response.data) {
          const status = response.data.status

          // If status changes from 0 to 1, navigate to success page
          if (status === 1 && !hasNavigatedRef.current) {
            hasNavigatedRef.current = true
            // Clear interval before navigating
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            router.push('/payment-success')
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
        // Continue polling even if there's an error
      }
    }

    // Check immediately
    checkPaymentStatus()

    // Set up interval to check every 2 seconds
    intervalRef.current = setInterval(checkPaymentStatus, 2000)

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [paymentId, router])

  const fetchQRCode = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getPaymentById(paymentId)

      if (response.isSuccess && response.data) {
        // response.data is a string (QR code URL), not an object
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
      {/* Title */}
      <Text style={styles.title}>Quét mã QR để thanh toán</Text>

      {/* Instruction */}
      <Text style={styles.instruction}>
        Sử dụng ứng dụng ngân hàng để quét mã QR và chuyển tiền tự động
      </Text>

      

      {/* QR Code */}
      <View style={styles.qrContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#000" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : qrUrl ? (
          <Image
            source={normalizeImageSource(qrUrl)}
            style={styles.qrCode}
            resizeMode="contain"
          />
        ) : (
          <Text style={styles.placeholderText}>Chọn gói để hiển thị mã QR</Text>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 8,
    textAlign: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#222',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 24,
    textAlign: 'center',
  },
  sepayLogoContainer: {
    marginBottom: 24,
  },
  sepayText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#0066CC',
    fontFamily: 'Lexend, sans-serif',
  },
  qrContainer: {
    width: 280,
    height: 280,
    borderWidth: 2,
    borderColor: '#003366',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  qrCode: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: '#E35345',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
  
})

