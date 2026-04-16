import React from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform } from 'react-native'
import { PaymentHistoryItem } from './payment-history-item.jsx'
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
  const isWeb = Platform.OS === 'web'

  return (
    <View style={styles.container}>
      {isWeb && (
        <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />
      )}

      <View style={isWeb ? styles.header : styles.headerNative}>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Lịch sử giao dịch</Text>
          <Text style={styles.subtitle}>Ghi lại toàn bộ hành trình nâng cấp của bạn</Text>
        </View>

        {isWeb && payments.length > 0 && (
          <View style={styles.recordCount}>
            <Text style={styles.countText}>{payments.length} Giao dịch</Text>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F1BE4B" />
          <Text style={styles.loadingText}>Đang lấy dữ liệu từ hệ thống...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Oops! {error}</Text>
        </View>
      ) : payments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>💳</Text>
          </View>
          <Text style={styles.emptyText}>Bạn chưa thực hiện giao dịch nào</Text>
          <Text style={styles.emptySubtext}>Các gói VIP đã mua sẽ xuất hiện tại đây</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
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
    flex: 1,
    minHeight: 600,
    position: 'relative',
  },
  carrot: {
    position: 'absolute',
    top: -40,
    right: 100,
    width: 120,
    height: 80,
    transform: [{ rotate: '15deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerNative: {
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerInfo: {
    gap: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  recordCount: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    fontFamily: 'Epilogue, sans-serif',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

