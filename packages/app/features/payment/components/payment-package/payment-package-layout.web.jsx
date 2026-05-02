import React from 'react'
import { View, ScrollView, StyleSheet, Text } from 'react-native'
import { Card as PackageFree } from './package-free'
import { Card as PackagePremium } from './package-premium-background'

export function PaymentPackageLayout() {
  return (
    <View style={styles.root}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Nâng cấp trải nghiệm <Text style={styles.highlight}>học tập</Text>
          </Text>
          <Text style={styles.subtitle}>
            Chọn gói dịch vụ phù hợp để bứt phá điểm số TOPIK ngay hôm nay cùng bạn Thỏ!
          </Text>
        </View>

        <View style={styles.wrapper}>
          <View style={styles.cardsContainer}>
            <View style={styles.cardWrapper}>
              <PackageFree />
            </View>

            <View style={styles.cardWrapper}>
              <PackagePremium />
            </View>
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
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    paddingVertical: 30, // Reduced from 60
  },
  header: {
    alignItems: 'center',
    marginBottom: 20, // Reduced from 40
  },
  title: {
    fontSize: 40, // Reduced from 48
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 8,
  },
  highlight: {
    color: '#F9A825',
    borderBottomWidth: 4,
    borderBottomColor: '#F9A825',
  },
  subtitle: {
    fontSize: 16, // Reduced from 18
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 24,
  },
  wrapper: {
    width: '100%',
    maxWidth: 1100,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 30,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: 480,
  },
})
