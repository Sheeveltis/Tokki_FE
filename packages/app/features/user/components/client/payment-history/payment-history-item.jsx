import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'

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
  const getStatusConfig = (status) => {
    // status: 0 = Đang chờ, 1 = Đã thanh toán, 2 = Thất bại
    switch (status) {
      case 0:
        return {
          color: '#D97706',
          bg: '#FEF3C7',
          border: '#FDE68A',
          label: payment.statusDisplay || 'Đang chờ'
        }
      case 1:
        return {
          color: '#059669',
          bg: '#D1FAE5',
          border: '#A7F3D0',
          label: payment.statusDisplay || 'Thành công'
        }
      case 2:
        return {
          color: '#DC2626',
          bg: '#FEE2E2',
          border: '#FECACA',
          label: payment.statusDisplay || 'Thất bại'
        }
      default:
        return {
          color: '#4B5563',
          bg: '#F3F4F6',
          border: '#E5E7EB',
          label: payment.statusDisplay || 'N/A'
        }
    }
  }

  const statusConfig = getStatusConfig(payment.status)

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerMain}>
          <Text style={styles.paymentIdLabel}>Mã giao dịch</Text>
          <Text style={styles.paymentId}>#{payment.paymentId}</Text>
        </View>
        <View 
          style={[
            styles.statusBadge, 
            { backgroundColor: statusConfig.bg, borderColor: statusConfig.border }
          ]}
        >
          <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.contentDivider} />

      <View style={styles.cardBody}>
        <View style={styles.mainInfo}>
          <View style={styles.amountGroup}>
            <Text style={styles.label}>Số tiền thanh toán</Text>
            <Text style={styles.amountText}>{formatPrice(payment.amount)} <Text style={styles.currency}>VNĐ</Text></Text>
          </View>
          
          {payment.vipPackageId && (
            <View style={styles.vipGroup}>
              <View style={styles.vipBadge}>
                <Text style={styles.vipLabel}>Gói VIP</Text>
              </View>
              <Text style={styles.vipName}>{payment.vipPackageId}</Text>
              {payment.currentRemainingDays !== undefined && (
                <Text style={styles.expiryText}>
                  Hạn dùng: {payment.currentRemainingDays} ngày
                </Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Ngày tạo</Text>
            <Text style={styles.detailValue}>{formatDate(payment.createdAt)}</Text>
          </View>
          
          {payment.paidAt && (
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Hoàn tất lúc</Text>
              <Text style={styles.detailValue}>{formatDate(payment.paidAt)}</Text>
            </View>
          )}

          {payment.description && (
            <View style={[styles.detailItem, { flexBasis: '100%', marginTop: 4 }]}>
              <Text style={styles.detailLabel}>Nội dung</Text>
              <Text style={styles.descriptionText} numberOfLines={1}>
                {payment.description}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerMain: {
    gap: 4,
  },
  paymentIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  paymentId: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    fontFamily: 'Epilogue, sans-serif',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  contentDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  cardBody: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    gap: 24,
  },
  mainInfo: {
    flex: 1,
    gap: 16,
  },
  amountGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  amountText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Lexend, sans-serif',
  },
  currency: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  vipGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  vipBadge: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vipLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  vipName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
    fontFamily: 'Epilogue, sans-serif',
  },
  expiryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  detailsGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    alignContent: 'flex-start',
  },
  detailItem: {
    flexBasis: '45%',
    gap: 4,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: 'Epilogue, sans-serif',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    fontFamily: 'Epilogue, sans-serif',
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
})

