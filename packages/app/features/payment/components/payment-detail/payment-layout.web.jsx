import React from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { QRIsepay } from './QR-isepay'
import { InformationBanking } from './Information-banking'
import { BackButton } from '../../../../../components/backBtn'
import { cancelPayment } from '../../api/payment-detail-api'
import { useRouter } from 'solito/navigation'
import { Modal, message } from 'antd'
import { showAdminSuccess, showAdminError } from '../../../../../components/HelperAdmin'
import { TouchableOpacity, Text } from 'react-native'

export function PaymentLayout({ paymentId, paymentUrl }) {
  const { width } = useWindowDimensions()
  const isMobile = width < 800
  const router = useRouter()

  const handleCancelPayment = () => {
    Modal.confirm({
      title: 'Xác nhận hủy thanh toán',
      content: 'Bạn có chắc chắn muốn hủy giao dịch này không? Hành động này không thể hoàn tác.',
      okText: 'Hủy thanh toán',
      okType: 'danger',
      cancelText: 'Quay lại',
      onOk: async () => {
        try {
          await cancelPayment(paymentId)
          router.push('/')
          // Hiển thị thông báo thành công sau khi về trang chủ
          showAdminSuccess('Hủy thanh toán thành công')
        } catch (error) {
          showAdminError(error?.message || 'Không thể hủy thanh toán')
        }
      },
    })
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, isMobile && { borderRadius: 24, padding: 10 }]}>
        <View style={[styles.contentContainer, isMobile && { flexDirection: 'column' }]}>
          {/* QR ISePay bên trái */}
          <View style={[styles.leftSection, isMobile && { padding: 10 }]}>
            <QRIsepay paymentId={paymentId} paymentUrl={paymentUrl} />
          </View>

          {/* Divider */}
          <View style={[styles.divider, isMobile && { width: '100%', height: 1, marginVertical: 20 }]} />

          {/* Information Banking bên phải */}
          <View style={[styles.rightSection, isMobile && { padding: 10 }]}>
            <InformationBanking paymentId={paymentId} />
          </View>
        </View>
      </View>

      {/* Buttons ở dưới */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleCancelPayment} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Hủy thanh toán</Text>
        </TouchableOpacity>
        
        <View style={{ width: 40 }} />

        <BackButton />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  leftSection: {
    flex: 1,
    padding: 20,
  },
  rightSection: {
    flex: 1,
    padding: 20,
  },
  divider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 40,
  },
  buttonContainer: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
})

