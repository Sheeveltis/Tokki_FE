import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card as PackagePremium } from '../payment-package/package-premium'
import { ChoosePackage } from './choose-package'
import { BackButton } from '../../../../../components/backBtn'

export function PremiumPackageLayout({ onBackPress }) {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <View style={styles.contentContainer}>
            {/* Left Section: Package Overview */}
            <View style={styles.leftSection}>
              <PackagePremium />
            </View>

            {/* Right Section: Package Selection */}
            <View style={styles.rightSection}>
              <ChoosePackage />
            </View>
          </View>

          {/* Back Button */}
          <View style={styles.buttonContainer}>
            <BackButton onPress={onBackPress} />
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFDF9',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 16,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  leftSection: {
    flex: 0.8,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1.2,
  },
  buttonContainer: {
    marginTop: 40,
    alignSelf: 'center',
  },
})
