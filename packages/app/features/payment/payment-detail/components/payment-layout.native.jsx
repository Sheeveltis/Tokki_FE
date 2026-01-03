import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { QRIsepay } from './QR-isepay'
import { InformationBanking } from './Information-banking'
import { BackButton } from '../../../../../components/backBtn'

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

      {/* Back Button ở dưới cùng */}
      <View style={styles.buttonContainer}>
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
    marginBottom: 20,
  },
})

