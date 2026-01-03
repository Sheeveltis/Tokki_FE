import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Card as PackageFree } from './package-free'
import { Card as PackagePremium } from './package-premium-background'
import { BackButton } from '../../../../../components/backBtn'
import { ViewDetailPackageButton } from './view-detail-package-btn'

/**
 * Payment Package Layout Component (Native/Mobile)
 * - Vertical layout for mobile screens
 * - Package Free on top
 * - Package Premium below
 * - Back button and View Detail button at the bottom
 */
export function PaymentPackageLayout() {
  return (
    <View style={styles.root}>
      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          {/* Card Free ở trên */}
          <View style={styles.topCard}>
            <PackageFree
              title="GÓI MIỄN PHÍ"
              subtitle="Bạn sẽ nhận được quyền lợi gì ?"
              benefits={[
                'Giải đề TOPIK tối đa 2 đề/ngày',
                'Chơi Minigame tối đa 5 lần/ngày',
                'Bị giới hạn số lần sử dụng AI trong một ngày',
                'Sử dụng được hệ thống Flashcard',
              ]}
              priceLabel="Miễn phí"
            />
          </View>

          {/* Card Premium ở dưới */}
          <View style={styles.bottomCard}>
            <PackagePremium />
            {/* Nút Xem chi tiết các gói */}
            <View style={styles.buttonContainerRight}>
              <ViewDetailPackageButton />
            </View>
          </View>

          {/* Nút Quay lại */}
          <View style={styles.buttonContainerLeft}>
            <BackButton />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 600,
  },
  topCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomCard: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonContainerLeft: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonContainerRight: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
})

