import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Navbar } from 'components/navbar'
import { Footer } from 'components/footer'
import { Card as PackageFree } from './package-free'
import { Card as PackagePremium } from './package-premium-background'
import { BackButton } from '@tokki/app/components/backbtn'
import { ViewDetailPackageButton } from './view-detail-package-btn'

export function PaymentPackageLayout() {
  return (
    <View style={styles.root}>
      {/* Navbar ở đầu trang */}
      <Navbar />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          {/* Container cho 2 cards */}
          <View style={styles.cardsContainer}>
            {/* Card Free bên trái */}
            <View style={styles.leftCard}>
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
              {/* Nút Quay lại */}
              <View style={styles.buttonContainerLeft}>
                <BackButton />
              </View>
            </View>

            {/* Gạch đen chia cách */}
            <View style={styles.divider} />

            {/* Card Premium bên phải */}
            <View style={styles.rightCard}>
              <PackagePremium />
              {/* Nút Xem chi tiết các gói */}
              <View style={styles.buttonContainerRight}>
                <ViewDetailPackageButton />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer ở cuối trang */}
      <Footer />
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
    alignItems: 'center',
    paddingVertical: 40,
    paddingBottom: 60,
  },
  wrapper: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
  },
  leftCard: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 20,
  },
  rightCard: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 20,
  },
  divider: {
    width: 2,
    height: 540,
    backgroundColor: '#000',
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  buttonContainerLeft: {
    marginTop: 24,
    alignItems: 'flex-start',
    left: 80,
    width: '100%',
  },
  buttonContainerRight: {
    marginTop: 24,
    alignItems: 'flex-end',
    right: 75,
    width: '100%',
  },
})

