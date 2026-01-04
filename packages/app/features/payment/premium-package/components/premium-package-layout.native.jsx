import React from 'react'
import { View, ScrollView, StyleSheet, Image } from 'react-native'
import { ChoosePackage } from './choose-package.native'
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
 * - Only shows ChoosePackage component
 * - Optimized for mobile screens
 * - Back button at the top
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
          {/* Back button ở trên */}
          <View style={styles.backButtonContainer}>
            <BackButton />
          </View>

          {/* Choose Package */}
          <View style={styles.choosePackageContainer}>
            <ChoosePackage />
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
    paddingBottom: 100, // Extra padding for navbar
  },
  wrapper: {
    width: '100%',
  },
  backButtonContainer: {
    width: '100%',
    marginBottom: 16,
  },
  choosePackageContainer: {
    width: '100%',
  },
})
