import React from 'react'
import { View, StyleSheet } from 'react-native'
import { QRIsepay } from './QR-isepay'
import { InformationBanking } from './Information-banking'
import { BackButton } from 'components/backbtn'

/**
 * Payment Layout Component (Web)
 * - Displays QR code payment on the left
 * - Displays bank account information on the right
 * - Divider in the middle
 * - Back button at the bottom
 *
 * @param {{
 *   paymentId?: string;
 * }} props
 */
export function PaymentLayout({ paymentId }) {
  return (
    <View style={styles.container}>
      {/* Container cho 2 phần */}
      <View style={styles.contentContainer}>
        {/* QR ISePay bên trái */}
        <View style={styles.leftSection}>
          <QRIsepay paymentId={paymentId} />
        </View>

        {/* Gạch đen chia cách */}
        <View style={styles.divider} />

        {/* Information Banking bên phải */}
        <View style={styles.rightSection}>
          <InformationBanking paymentId={paymentId} />
        </View>
      </View>

      {/* Back Button ở dưới */}
      <View style={styles.buttonContainer}>
        <BackButton />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
    marginBottom: 40,
  },
  leftSection: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 30,
  },
  rightSection: {
    flex: 1,
    paddingLeft: 20,
  },
  divider: {
    width: 2,
    height: 600,
    backgroundColor: '#000',
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 24,
    right: 450,
  },
})

