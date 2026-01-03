import React, { useState, useRef } from 'react'
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native'
import { Card as PackageFree } from './package-free'
import { Card as PackagePremium } from './package-premium-background'
import { BackButton } from '../../../../../components/backBtn'
import { ViewDetailPackageButton } from './view-detail-package-btn'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

/**
 * Payment Package Layout Component (Native/Mobile)
 * - Horizontal scrollable carousel for mobile screens
 * - Swipe between Free and Premium packages
 * - Pagination dots to show current package
 */
export function PaymentPackageLayout() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollViewRef = useRef(null)

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x
    const index = Math.round(scrollPosition / SCREEN_WIDTH)
    setCurrentIndex(index)
  }

  return (
    <View style={styles.root}>
      {/* Title */}
      <View style={styles.titleContainer}>
        <BackButton style={styles.backButton} />
      </View>

      {/* Horizontal ScrollView for packages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Package Free - Page 1 */}
        <View style={styles.page}>
          <View style={styles.cardContainer}>
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
        </View>

        {/* Package Premium - Page 2 */}
        <View style={styles.page}>
          <View style={styles.cardContainer}>
            <PackagePremium />
            {/* Nút Xem chi tiết các gói */}
            <View style={styles.buttonContainerRight}>
              <ViewDetailPackageButton />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.dot, currentIndex === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentIndex === 1 && styles.dotActive]} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    paddingBottom: 80, // Padding for navbar
  },
  titleContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
  },
  page: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  buttonContainerRight: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 20, // Extra padding for navbar
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  dotActive: {
    backgroundColor: '#000',
    width: 24,
  },
})
