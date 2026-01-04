import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Payment History Item Component
 * @param {{
 *   payment: {
 *     paymentId: string
 *     amount: number
 *     description: string
 *     status: number
 *     createdAt: string
 *     paidAt: string | null
 *     vipPackageId: string
 *     currentVipExpirationDate: string
 *     currentRemainingDays: number
 *     statusDisplay: string
 *   }
 *   formatDate: (dateString: string) => string
 *   formatPrice: (price: number) => string
 * }} props
 */
export function PaymentHistoryItem({ payment, formatDate, formatPrice }) {
  const getStatusColor = (status) => {
    // status: 0 = Đang chờ, 1 = Đã thanh toán, 2 = Thất bại
    switch (status) {
      case 0:
        return '#FFA500' // Orange - Đang chờ
      case 1:
        return '#28A745' // Green - Đã thanh toán
      case 2:
        return '#DC3545' // Red - Thất bại
      default:
        return '#666'
    }
  }

  const getStatusBgColor = (status) => {
    switch (status) {
      case 0:
        return '#FFF4E6' // Light orange
      case 1:
        return '#E8F5E9' // Light green
      case 2:
        return '#FFEBEE' // Light red
      default:
        return '#F5F5F5'
    }
  }

  return (
    <View style={styles.card}>
      {/* Payment ID */}
      <View style={styles.paymentIdRow}>
        <Text style={styles.paymentIdLabel}>Mã giao dịch:</Text>
        <Text style={styles.paymentId}>{payment.paymentId}</Text>
      </View>

      {/* Status Badge - Separate row */}
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Trạng thái:</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(payment.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
            {payment.statusDisplay}
          </Text>
        </View>
      </View>

      {/* Amount */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountLabel}>Số tiền:</Text>
        <Text style={styles.amount}>{formatPrice(payment.amount)} VNĐ</Text>
      </View>

      {/* Description */}
      {payment.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Mô tả:</Text>
          <Text style={styles.description}>{payment.description}</Text>
        </View>
      )}

      {/* Dates */}
      <View style={styles.datesContainer}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Ngày tạo:</Text>
          <Text style={styles.dateValue}>{formatDate(payment.createdAt)}</Text>
        </View>
        {payment.paidAt && (
          <View style={styles.dateItem}>
            <Text style={styles.dateLabel}>Ngày thanh toán:</Text>
            <Text style={styles.dateValue}>{formatDate(payment.paidAt)}</Text>
          </View>
        )}
      </View>

      {/* VIP Package Info */}
      {payment.vipPackageId && (
        <View style={styles.vipContainer}>
          <Text style={styles.vipLabel}>Gói VIP:</Text>
          <Text style={styles.vipValue}>{payment.vipPackageId}</Text>
          {payment.currentRemainingDays !== undefined && (
            <Text style={styles.remainingDays}>
              Còn lại: {payment.currentRemainingDays} ngày
            </Text>
          )}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 16,
  },
  paymentIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  paymentIdLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  paymentId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  amount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#E05668',
    fontFamily: 'Lexend, sans-serif',
  },
  descriptionContainer: {
    gap: 4,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  description: {
    fontSize: 14,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  datesContainer: {
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
  },
  dateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  vipContainer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F2',
    gap: 4,
  },
  vipLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  vipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFD700',
    fontFamily: 'Epilogue, sans-serif',
  },
  remainingDays: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
})

