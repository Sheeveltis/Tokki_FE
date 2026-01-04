import React from 'react'
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native'
import { Navbar } from '../../../../../../components/navbar'
import { UserDashboard } from '../../../components/user-dashboard'
import { PaymentHistoryContent } from './PaymentHistoryContent'
import BgPattern from '../../../../../../assets/background2.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Payment History Layout (Web)
 * - Two-column layout with dashboard on left and payment history on right
 * - Includes Navbar and background
 */
export function PaymentHistoryLayout({ payments, loading, error, onActionPress }) {
  return (
    <View style={styles.root}>
      <Navbar />

      <ImageBackground
        source={normalizeImageSource(BgPattern)}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <UserDashboard onActionPress={onActionPress} initialActive="history" />
            <View style={styles.spacer} />
            <PaymentHistoryContent payments={payments} loading={loading} error={error} />
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bg: {
    flex: 1,
  },
  bgImage: {
    opacity: 0.3,
  },
  content: {
    paddingVertical: 48,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    maxWidth: 1280,
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  spacer: {
    width: 12,
  },
})

