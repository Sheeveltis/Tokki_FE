import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { QRIsepay } from './QR-isepay'
import { InformationBanking } from './Information-banking'
import { BackButton } from '../../../../../components/backBtn'
import { cancelPayment } from '../../api/payment-detail-api'
import { useRouter } from 'solito/navigation'
import { Alert, TouchableOpacity, Text } from 'react-native'
import { showSuccess, showError } from '../../authentication/utils/notification'

/**
 * Payment Layout Component (Native/Mobile)
 * - Displays QR code payment on top
 * - Displays bank account information below
 * - Vertical layout for mobile screens
 * - Back button at the bottom
 *
 * @param {{
 *   paymentId?: string;
 *   paymentUrl?: string;
 * }} props
 */
export function PaymentLayout({ paymentId, paymentUrl }) {
  const router = useRouter()

  const handleCancelPayment = () => {
    Alert.alert(
      'Xác nhận hủy thanh toán',
      'Bạn có chắc chắn muốn hủy giao dịch này không?',
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy thanh toán',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelPayment(paymentId)
              router.push('/')
              showSuccess('Hủy thanh toán thành công')
            } catch (error) {
              showError(error?.message || 'Không thể hủy thanh toán')
            }
          }
        }
      ]
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* QR ISePay ở trên */}
      <View style={styles.topSection}>
        <QRIsepay paymentId={paymentId} paymentUrl={paymentUrl} />
      </View>

      {/* Information Banking ở dưới */}
      <View style={styles.bottomSection}>
        <InformationBanking paymentId={paymentId} />
      </View>

      {/* Buttons ở dưới cùng */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCancelPayment} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Hủy thanh toán</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />

        <BackButton />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100, // Extra padding for navbar
    alignItems: 'center',
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSection: {
    width: '100%',
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
})

