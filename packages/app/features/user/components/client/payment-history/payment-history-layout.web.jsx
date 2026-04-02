import React from 'react'
import { ImageBackground, ScrollView, StyleSheet, View } from 'react-native'
import { UserDashboard } from '../../admin/user-management/user-dashboard'
import { PaymentHistoryContent } from './payment-history-content'
import BgPattern from '../../../../../../assets/background2.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function PaymentHistoryLayout({ payments, loading, error, onActionPress }) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={normalizeImageSource(BgPattern)}
        style={styles.bg}
        resizeMode="cover"
        imageStyle={styles.bgImage}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.row}>
            <UserDashboard onActionPress={onActionPress} initialActive="history" />
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
    opacity: 0.1, // Even subtler background
  },
  content: {
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  row: {
    width: '100%',
    maxWidth: 1400, // Matching study and profile layout width
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
  },
})

