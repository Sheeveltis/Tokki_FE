import React from 'react'
import { View, ScrollView, StyleSheet, Image } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { Footer } from '../../../../../components/footer'
import { Card as PackagePremium } from '../../payment-package/components/package-premium'
import { ChoosePackage } from './choose-package'
import { BackButton } from '../../../../../components/backBtn'
import BackgroundImage from '../../../../../assets/background1.png'

/**
 * Normalize image source so it works with:
 * - require('...png') / numeric ids
 * - { uri: '...' }
 * - Next/webpack static imports: { src: '...' }
 */
const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) {
    return { uri: src.src }
  }
  if (typeof src === 'string') {
    return { uri: src }
  }
  return src
}

export function PremiumPackageLayout() {
  return (
    <View style={styles.root}>
      {/* Background image */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={styles.backgroundImage}
      />

      {/* Navbar ở đầu trang */}
      <Navbar />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          {/* Container cho 2 phần */}
          <View style={styles.contentContainer}>
            {/* Package Premium bên trái */}
            <View style={styles.leftSection}>
              <PackagePremium />
              {/* Nút Quay lại */}
              <View style={styles.buttonContainerLeft}>
                <BackButton />
              </View>
            </View>

            {/* Gạch đen chia cách */}
            <View style={styles.divider} />

            {/* Choose Package bên phải */}
            <View style={styles.rightSection}>
              <ChoosePackage />
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
    position: 'relative',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    opacity: 0.3,
    zIndex: 0,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 1,
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
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: 0,
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
    height: 400,
    backgroundColor: '#000',
    marginHorizontal: 20,
    alignSelf: 'center',
  },
  buttonContainerLeft: {
    marginTop: 24,
    alignItems: 'flex-start',
    width: '100%',
    left: 30,
  },
})

