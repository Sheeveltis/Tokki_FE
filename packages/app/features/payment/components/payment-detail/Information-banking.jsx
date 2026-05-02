import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { UserOutlined, CreditCardOutlined, BankOutlined, FileTextOutlined, CopyOutlined } from '@ant-design/icons'

export const InformationBanking = ({ paymentId, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Thông tin chuyển khoản</Text>

      <View style={styles.cardsContainer}>
        {/* Chủ tài khoản */}
        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E8F5E9' }]}>
            <UserOutlined style={{ fontSize: 18, color: '#4CAF50' }} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>Chủ tài khoản</Text>
            <Text style={styles.value}>TANG NGOC TRANG ANH</Text>
          </View>
        </View>

        {/* Số tài khoản */}
        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#E3F2FD' }]}>
            <CreditCardOutlined style={{ fontSize: 18, color: '#2196F3' }} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>Số tài khoản</Text>
            <Text style={styles.accountNumber}>0037100025583005</Text>
          </View>
          <CopyOutlined style={{ color: '#999', fontSize: 16 }} />
        </View>

        {/* Ngân hàng */}
        <View style={styles.card}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF3E0' }]}>
            <BankOutlined style={{ fontSize: 18, color: '#FF9800' }} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>Ngân hàng</Text>
            <Text style={styles.value}>OCB (Ngân hàng Phương Đông)</Text>
          </View>
        </View>

        {/* Nội dung chuyển tiền */}
        <View style={[styles.card, styles.highlightCard]}>
          <View style={[styles.iconWrapper, { backgroundColor: '#FFF0F3' }]}>
            <FileTextOutlined style={{ fontSize: 18, color: '#FF4D6D' }} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>Nội dung chuyển tiền</Text>
            <Text style={[styles.value, { color: '#FF4D6D', fontWeight: '800' }]}>{paymentId || '---'}</Text>
          </View>
          <CopyOutlined style={{ color: '#FF4D6D', fontSize: 16 }} />
        </View>
      </View>

      <Text style={styles.note}>
        * Lưu ý: Hãy nhập đúng nội dung chuyển tiền để hệ thống tự động kích hoạt gói của bạn.
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 24,
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EBF1',
  },
  highlightCard: {
    backgroundColor: '#FFF0F3',
    borderColor: '#FFD1DC',
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
  },
  accountNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    letterSpacing: 0.5,
  },
  note: {
    marginTop: 24,
    fontSize: 13,
    color: '#888',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 18,
  },
})

