'use client'

import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground } from 'react-native'
import { useRouter } from 'next/navigation'

import Background2 from '../../../../assets/background2.png'
import GameCardIcon from '../../../../assets/icon/icon-mainflow/game-card.svg'
import BunnyDeveloping from '../../../../assets/bunny/9.png'
import { BackButton } from '../../../../components/backBtn'
import { MinigameHappy } from './minigame-happy'
import { MinigameRankingButton } from './minigame-ranking-button'
import { MinigameBanner } from './minigame-banner'
import { MatchingCardBanner } from '../matching-card/matching-card-play/components/matching-card-banner'
import { MinigameCard } from './minigame-card'
import { MinigamePopupRule } from './minigame-popup-rule'
import { MinigameTopic } from './minigame-topic'
import { MinigameLevel } from './minigame-level'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

export function MinigameLayout() {
  const [showRule, setShowRule] = useState(false)
  const [showTopic, setShowTopic] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState(null)
  const [showLevel, setShowLevel] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const router = useRouter()

  const handleConfirmTopic = (topic) => {
    setSelectedTopic(topic)
    setShowTopic(false)
    setShowLevel(true)
  }

  const handleConfirmLevel = (level) => {
    setSelectedLevel(level)
    setShowLevel(false)

    const topicId = selectedTopic?.id || 'life'
    const topicName = selectedTopic?.titleKo
    const levelId = level?.id || 'medium'

    const query = new URLSearchParams()
    query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelId)
    router.push(`/minigame/matching-card?${query.toString()}`)
  }

  return (
    <ImageBackground
      source={normalizeImageSource(Background2)}
      resizeMode="cover"
      style={styles.page}
      imageStyle={styles.backgroundImage}
    >
      <View style={styles.inner}>
        <View style={styles.sideLeft}>
          <MinigameHappy />
        </View>

        <View style={styles.centerCardWrapper}>
          <View style={styles.centerCard}>
            <View style={styles.headerRow}>
              <BackButton style={styles.backButton} />

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
                <MatchingCardBanner onStart={() => setShowRule(true)} />
              </View>

              <View style={styles.cardCol}>
                <MinigameCard
                  header={
                    <Text style={styles.soonTitle}>Tính năng đang được phát triển thêm</Text>
                  }
                >
                  <View style={styles.soonBody}>
                    <Image
                      source={normalizeImageSource(BunnyDeveloping)}
                      style={styles.soonImage}
                      resizeMode="contain"
                    />
                  </View>
                </MinigameCard>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sideRight}>
          <MinigameRankingButton />
        </View>
      </View>

      <MinigamePopupRule
        visible={showRule}
        onClose={() => setShowRule(false)}
        onSelectTopic={() => {
          setShowRule(false)
          setShowTopic(true)
        }}
      />

      <MinigameTopic
        visible={showTopic}
        onClose={() => setShowTopic(false)}
        onConfirm={handleConfirmTopic}
        selectedId={selectedTopic?.id}
      />

      <MinigameLevel
        visible={showLevel}
        onClose={() => setShowLevel(false)}
        onConfirm={handleConfirmLevel}
        selectedId={selectedLevel?.id}
      />
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    height: '110vh',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 32,
  },
  backgroundImage: {
    opacity: 0.5,
  },
  inner: {
    width: '100%',
    maxWidth: 1200,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    paddingHorizontal: 50,
    paddingVertical: 32,
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
    height: '100vh',
    minHeight: 520,
    opacity: 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
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
})


