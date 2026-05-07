import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform, ScrollView, Animated, Dimensions } from 'react-native'
import { LoadingWithContainer } from 'components/Loading'
import { getFlashcardsByTopic, addFavorite, removeFavorite, normalizeImageSource } from '@tokki/app/features/study/api'
import DefaultBunny from 'assets/bunny/14.png'
import { GuidelineModal } from 'components/GuidelineModal'
import { FLASHCARD_GUIDELINE } from '@tokki/app/features/study/guideline-data'

// Import expo-av cho mobile
let ExpoAudio = null
if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av')
    ExpoAudio = expoAv.Audio
  } catch (e) {
    // expo-av chưa được cài đặt
  }
}

const VocabCard = ({ vocab }) => {
  const [isFavorite, setIsFavorite] = useState(vocab?._raw?.isFavorite || false)
  const soundRef = useRef(null)

  const cleanupAudio = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync()
      } catch (e) {
        // ignore
      }
      soundRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      cleanupAudio()
    }
  }, [])

  const playAudio = async (url) => {
    if (!url || !ExpoAudio) return
    try {
      await cleanupAudio()
      const { sound } = await ExpoAudio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, volume: 1.0 }
      )
      soundRef.current = sound

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          soundRef.current = null
        }
      })
    } catch (err) {
      console.error('Error playing audio on mobile:', err)
    }
  }

  const toggleFavorite = async () => {
    try {
      const nextState = !isFavorite
      setIsFavorite(nextState)
      if (nextState) {
        await addFavorite(vocab.id)
      } else {
        await removeFavorite(vocab.id)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
      setIsFavorite(isFavorite) // Revert on error
    }
  }

  return (
    <View style={styles.vocabCard}>
      <View style={styles.vocabImageWrapper}>
        <Image
          source={vocab.imageUrl ? { uri: vocab.imageUrl } : normalizeImageSource(DefaultBunny)}
          style={styles.vocabImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.vocabInfo}>
        <View style={styles.vocabHeaderLine}>
          <Text style={styles.vocabWord}>{vocab.word}</Text>

        </View>

        {vocab.pronunciation && (
          <Text style={styles.vocabPronunciation}>/{vocab.pronunciation}/</Text>
        )}

        <Text style={styles.vocabMeaning} numberOfLines={2}>{vocab.meaning}</Text>
      </View>
    </View>
  )
}

const StartLearningButton = ({ onPress }) => {
  const buttonScale = useRef(new Animated.Value(1)).current

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: false,
    }).start()
  }

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: false,
    }).start()
  }

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.startLearningBtn}
      >
        <View style={styles.startLearningInner}>
          <Text style={styles.startLearningText}>BẮT ĐẦU</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export function FlashcardFirstLearnList({
  topicId,
  onStartLearning,
  onStartStudy
}) {
  const [vocabularies, setVocabularies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showInstructions, setShowInstructions] = useState(false)

  const fetchVocabularies = async () => {
    if (!topicId) return
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardsByTopic(topicId)
      setVocabularies(data || [])
    } catch (err) {
      setError(err.message || 'Không thể tải danh sách từ vựng')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVocabularies()
  }, [topicId])

  if (loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải danh sách từ vựng..."
        style={{ flex: 1, minHeight: 400 }}
      />
    )
  }

  if (error && vocabularies.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchVocabularies}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {vocabularies.length > 0 && (
        <View style={styles.heroBanner}>

          <View style={styles.heroContent}>
            <View style={styles.heroVisual}>
              <Image source={normalizeImageSource(DefaultBunny)} style={styles.heroRabbitImage} resizeMode="contain" />
              <View style={styles.sparkleBadge}>
                <Text style={{ fontSize: 10 }}>✨</Text>
              </View>
            </View>

            <View style={styles.heroMain}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroHeading}>
                  Bạn có <Text style={{ color: '#F1BE4B' }}>{vocabularies.length} từ vựng</Text> cần học!
                </Text>
                <Text style={styles.heroSubHeading}>
                  Chinh phục toàn bộ từ vựng trong chủ đề này để thăng hạng ngay nhé.
                </Text>
              </View>
            </View>

            <View style={styles.heroAction}>
              <StartLearningButton onPress={onStartLearning} />
              <TouchableOpacity
                style={styles.secondaryStudyBtn}
                onPress={onStartStudy}
              >
                <Text style={styles.secondaryStudyText}>Học Flashcard</Text>
              </TouchableOpacity>
            </View>
          </View>

          <GuidelineModal
            visible={showInstructions}
            steps={FLASHCARD_GUIDELINE}
            onClose={() => setShowInstructions(false)}
            primaryColor="#F1BE4B"
          />
        </View>
      )}

      <View style={[styles.mainContent, { flex: 1 }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, gap: 16, flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
        >
          {vocabularies.length > 0 ? (
            <View style={styles.listGrid}>
              {vocabularies.map((vocab) => (
                <VocabCard key={vocab.id} vocab={vocab} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Image source={normalizeImageSource(DefaultBunny)} style={styles.emptyImage} resizeMode="contain" />
              <Text style={styles.emptyTitle}>Chưa có từ vựng nào</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
    margin: 16,
    marginBottom: 8,
  },
  heroInfoBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  heroContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  heroVisual: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF9EB',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFF',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heroRabbitImage: {
    width: 80,
    height: 80,
  },
  heroMain: {
    width: '100%',
    alignItems: 'center',
  },
  heroTextContent: {
    gap: 6,
    alignItems: 'center',
  },
  heroHeading: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  heroSubHeading: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    textAlign: 'center',
  },
  heroAction: {
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    gap: 12,
  },
  secondaryStudyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  secondaryStudyText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  startLearningBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  startLearningInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    gap: 12,
  },
  startLearningText: {
    color: '#451a03',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  startLearningIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  listGrid: {
    flexDirection: 'column',
    gap: 12,
    width: '100%',
  },
  vocabCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
  },
  vocabImageWrapper: {
    width: 70,
    height: 70,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  vocabImage: {
    width: '100%',
    height: '100%',
  },
  vocabInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  vocabHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  audioBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vocabPronunciation: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  vocabMeaning: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#FF4D4F',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    marginTop: 12,
  },
})
