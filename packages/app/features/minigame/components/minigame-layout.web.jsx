'use client'

import React from 'react'
import { View, Text, StyleSheet, Image, Pressable } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { Navbar } from 'components/navbar'

import GameCardIcon from '../../../../assets/icon/icon-mainflow/game-card.svg'
import BunnyDeveloping from '../../../../assets/bunny/9.png'
import { NavigationPill } from 'components/navigation-pill'
import { MinigameHappy } from './minigame-happy'
import { MinigameRankingButton } from './minigame-ranking-button'
import { MinigameBanner } from './minigame-banner'
import { MatchingCardBanner } from '../matching-card/matching-card-play/components/matching-card-play-banner'
import { MinigameMatchingCard } from './minigame-matching-card'
import ArrowIcon from '../../../../assets/icon/icon-mainflow/arrow.svg'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MinigameLayout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelId = searchParams?.get('level') || ''

  const goToMatchingCardRule = () => {
    const query = new URLSearchParams()
    if (levelId) {
      query.set('level', levelId)
    }
    const url =
      query.toString().length > 0
        ? `/minigame/matching-card/matching-card-rule?${query.toString()}`
        : '/minigame/matching-card/matching-card-rule'
    router.push(url)
  }

  return (
    <View style={styles.page}>
      <Navbar />

      <View style={styles.inner}>
        <View style={styles.sideLeft}>
          <MinigameHappy />
        </View>

        <View style={styles.centerCardWrapper}>
          <View style={styles.centerCard}>
            <View style={styles.headerRow}>
              <NavigationPill
                label="Quay lại"
                icon={ArrowIcon}
                onPress={() => router.back()}
                style={styles.backPill}
                textStyle={styles.backPillText}
                iconStyle={styles.backPillIcon}
              />

              <View style={styles.titleRow}>
                <Image
                  source={normalizeImageSource(GameCardIcon)}
                  style={styles.titleIcon}
                  resizeMode="contain"
                />
                <Text style={styles.titleText}>MiniGame</Text>
              </View>

              <View style={styles.headerRightSpacer} />
            </View>

            <View style={styles.bannerWrapper}>
              <MinigameBanner />
            </View>

            <View style={styles.cardsRow}>
              <View style={styles.cardCol}>
                <MatchingCardBanner onStart={goToMatchingCardRule} />
              </View>

              <View style={styles.cardCol}>
                <MinigameMatchingCard
                  header={<Text style={styles.soonTitle}>Tính năng đang được phát triển thêm</Text>}
                  onPress={goToMatchingCardRule}
                >
                  <View style={styles.soonBody}>
                    <Image
                      source={normalizeImageSource(BunnyDeveloping)}
                      style={styles.soonImage}
                      resizeMode="contain"
                    />
                  </View>
                </MinigameMatchingCard>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sideRight}>
          <MinigameRankingButton />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingBottom: 24,
    backgroundColor: '#FFD7D0',
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 24,
  },
  sideLeft: {
    flex: 0.6,
    alignItems: 'flex-start',
    right: 100,
  },
  sideRight: {
    flex: 0.6,
    alignItems: 'flex-end',
    left: 100,
    top: 30,
  },
  centerCardWrapper: {
    flex: 3,
    paddingHorizontal: 16,
    height: '100%',
  },
  centerCard: {
    backgroundColor: '#F5F0DD',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 28,
    shadowColor: '#00000020',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    minHeight: 520,
    flex: 1,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backPill: {
    backgroundColor: '#FFFFFF',
  },
  backPillText: {
    fontWeight: '700',
  },
  backPillIcon: {
    transform: [{ scaleX: -1 }],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleIcon: {
    width: 32,
    height: 32,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerRightSpacer: {
    width: 60,
  },
  bannerWrapper: {
    marginBottom: 24,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
  },
  cardCol: {
    flex: 1,
    alignItems: 'center',
    transform: [{ scale: 0.8 }],
  },
  soonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  soonBody: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soonImage: {
    width: '100%',
    height: '100%',
  },
  cardPressable: {
    width: '100%',
  },
})


