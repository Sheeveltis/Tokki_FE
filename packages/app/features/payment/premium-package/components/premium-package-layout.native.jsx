import React from 'react'
import { View, ScrollView, StyleSheet, Image } from 'react-native'
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

/**
 * Premium Package Layout Component (Native/Mobile)
 * - Vertical layout for mobile screens
 * - Package Premium on top
 * - Choose Package below
 * - Back button at the bottom
 */
export function PremiumPackageLayout() {
  return (
    <View style={styles.root}>
      {/* Background image */}
      <Image
        source={normalizeImageSource(BackgroundImage)}
        style={styles.backgroundImage}
      />

      {/* Nội dung chính */}
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.wrapper}>
          {/* Package Premium ở trên */}
          <View style={styles.topSection}>
            <PackagePremium />
          </View>

          {/* Choose Package ở dưới */}
          <View style={styles.bottomSection}>
            <ChoosePackage />
          </View>

          {/* Nút Quay lại */}
          <View style={styles.buttonContainer}>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 600,
  },
  topSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
})

