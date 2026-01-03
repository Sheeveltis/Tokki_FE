import React from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native'
import { PaymentHistoryItem } from './PaymentHistoryItem'
import Carrot from '../../../../../../assets/carrot.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Format date từ ISO string sang định dạng Việt Nam
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date (dd/mm/yyyy HH:mm)
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (error) {
    return 'N/A'
  }
}

/**
 * Format price với thousand separators
 * @param {number} price - Price value
 * @returns {string} Formatted price
 */
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price)
}

export function PaymentHistoryContent({ payments, loading, error }) {
  return (
    <View style={styles.container}>
      <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />

      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
        <Text style={styles.subtitle}>Xem lại các giao dịch thanh toán của bạn</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7FA14D" />
          <Text style={styles.loadingText}>Đang tải lịch sử...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có giao dịch nào</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContainer}>
          {payments.map((payment) => (
            <PaymentHistoryItem
              key={payment.paymentId}
              payment={payment}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          ))}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5F0DD',
    borderRadius: 30,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 18,
    flex: 1,
    minHeight: 400,
    position: 'relative',
  },
  carrot: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 200,
    height: 100,
    zIndex: 2,
    pointerEvents: 'none',
  },
  header: {
    gap: 6,
    paddingRight: 100,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
  },
  subtitle: {
    fontSize: 14,
    color: '#2C2C2C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    gap: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})

