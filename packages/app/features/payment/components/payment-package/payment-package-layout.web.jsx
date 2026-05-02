import React from 'react'
import { View, ScrollView, StyleSheet, Text, useWindowDimensions } from 'react-native'
import { Card as PackageFree } from './package-free'
import { Card as PackagePremium } from './package-premium-background'

export function PaymentPackageLayout() {
  const { width } = useWindowDimensions()
  const isMobile = width < 900
  const isSmallMobile = width < 600

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.container,
          isMobile && styles.containerMobile
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[
            styles.title,
            isMobile && styles.titleMobile,
            isSmallMobile && styles.titleSmallMobile
          ]}>
            Nâng cấp trải nghiệm <Text style={styles.highlight}>học tập</Text>
          </Text>
          <Text style={[
            styles.subtitle,
            isMobile && styles.subtitleMobile
          ]}>
            Chọn gói dịch vụ phù hợp để bứt phá điểm số TOPIK ngay hôm nay cùng bạn Thỏ!
          </Text>
        </View>

        <View style={[
          styles.wrapper,
          isMobile && styles.wrapperMobile
        ]}>
          <View style={[
            styles.cardsContainer,
            isMobile && styles.cardsContainerMobile
          ]}>
            <View style={[
              styles.cardWrapper,
              isMobile && styles.cardWrapperMobile
            ]}>
              <PackageFree />
            </View>

            <View style={[
              styles.cardWrapper,
              isMobile && styles.cardWrapperMobile
            ]}>
              <PackagePremium />
            </View>
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
    backgroundColor: '#FFFDF9',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  containerMobile: {
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    maxWidth: 800,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Lexend, sans-serif',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleMobile: {
    fontSize: 36,
  },
  titleSmallMobile: {
    fontSize: 28,
  },
  highlight: {
    color: '#F9A825',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 28,
  },
  subtitleMobile: {
    fontSize: 15,
    lineHeight: 22,
  },
  wrapper: {
    width: '100%',
    maxWidth: 1100,
  },
  wrapperMobile: {
    maxWidth: 500,
  },
  cardsContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    gap: 30,
  },
  cardsContainerMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 40,
  },
  cardWrapper: {
    flex: 1,
    maxWidth: 480,
    width: '100%',
  },
  cardWrapperMobile: {
    flex: 0,
    width: '100%',
  },
})
