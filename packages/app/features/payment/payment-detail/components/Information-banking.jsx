import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

/**
 * Information Banking Component
 * - Displays bank account information
 * - Shows account holder, account number, bank, and transfer content
 *
 * @param {{
 *   paymentId?: string;
 *   style?: any;
 * }} props
 */
export const InformationBanking = ({ paymentId, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Title */}
      <Text style={styles.title}>Thông tin tài khoản</Text>

      {/* Account Information Cards */}
      <View style={styles.cardsContainer}>
        {/* Chủ tài khoản */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.personIcon} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>CHỦ TÀI KHOẢN</Text>
            <Text style={styles.value}>TANG NGOC TRANG ANH</Text>
          </View>
        </View>

        {/* Số tài khoản */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.cardIcon} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>SỐ TÀI KHOẢN</Text>
            <Text style={styles.accountNumber}>0037100025583005</Text>
          </View>
        </View>

        {/* Ngân hàng */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.bankIcon} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>NGÂN HÀNG</Text>
            <Text style={styles.value}>OCB</Text>
          </View>
        </View>

        {/* Nội dung chuyển tiền */}
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <View style={styles.documentIcon} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.label}>NỘI DUNG CHUYỂN TIỀN</Text>
            <Text style={styles.value}>{paymentId || '---'}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    padding: 24,
    borderRadius: 16,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
    fontFamily: 'Lexend, sans-serif',
    textAlign: 'center',
    marginBottom: 24,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#222',
  },
  cardIcon: {
    width: 24,
    height: 18,
    borderRadius: 4,
    backgroundColor: '#222',
    borderWidth: 1,
    borderColor: '#222',
  },
  bankIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#222',
    borderRadius: 4,
    position: 'relative',
  },
  documentIcon: {
    width: 20,
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#222',
    borderRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC143C',
    fontFamily: 'Lexend, sans-serif',
    textTransform: 'uppercase',
  },
  accountNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    fontFamily: 'Lexend, sans-serif',
  },
})

