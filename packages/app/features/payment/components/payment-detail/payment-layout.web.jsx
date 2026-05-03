import React from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { QRIsepay } from './QR-isepay'
import { InformationBanking } from './Information-banking'
import { BackButton } from '../../../../../components/backBtn'

export function PaymentLayout({ paymentId, paymentUrl }) {
  const { width } = useWindowDimensions()
  const isMobile = width < 800

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
    alignSelf: 'center',
  },
})

