import React, { useState, useEffect, useRef } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform, ScrollView, Animated } from 'react-native'
import { LoadingWithContainer } from 'components/Loading'
import { getFlashcardsByTopic, addFavorite, removeFavorite } from '@tokki/app/features/study/api'
import DefaultBunny from 'assets/bunny/14.png'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ButtonUI1 from 'components/decor/buttonUI1'

const HeartIconSVG = ({ filled }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? "#EF4444" : "none"} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
      stroke={filled ? "#EF4444" : "#64748B"} 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
  </svg>
)

const InfoIconSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="2" />
    <path d="M12 16V12" stroke="#666" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 8H12.01" stroke="#666" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const InfoIcon = () => {
  if (Platform.OS !== 'web') {
    // Basic fallback for mobile
    return <Text style={{ color: '#666' }}>i</Text>
  }
  return <InfoIconSVG />
}

const VocabCard = ({ vocab }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(vocab?._raw?.isFavorite || false)

  const playAudio = (url) => {
    if (!url) return
    const audio = new Audio(url)
    audio.play()
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
    <View
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.vocabCard,
        isHovered && styles.vocabCardHover
      ]}
    >
      <View style={styles.vocabImageWrapper}>
        <Image
          source={vocab.imageUrl ? { uri: vocab.imageUrl } : DefaultBunny}
          style={styles.vocabImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.vocabInfo}>
        <View style={styles.vocabHeaderLine}>
          <Text style={styles.vocabWord}>{vocab.word}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {vocab.audioUrl && (
              <TouchableOpacity onPress={() => playAudio(vocab.audioUrl)} style={styles.audioBtn}>
                <StudyIcon source={SoundIcon} width={20} height={20} tintColor="#F1BE4B" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteBtn}>
              <HeartIconSVG filled={isFavorite} />
            </TouchableOpacity>
          </View>
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
  const [isHovered, setIsHovered] = useState(false)
  const shineAnim = useRef(new Animated.Value(-1)).current
  const iconTranslate = useRef(new Animated.Value(0)).current
  const buttonScale = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isHovered) {
      // Shine animation
      shineAnim.setValue(-1)
      Animated.timing(shineAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: false,
      }).start()

      // Icon translate animation
      Animated.spring(iconTranslate, {
        toValue: 4,
        friction: 4,
        tension: 40,
        useNativeDriver: false,
      }).start()
    } else {
      Animated.timing(iconTranslate, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }
  }, [isHovered])

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

  const shineTranslateX = shineAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-100%', '100%'],
  })

  return (
    <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={[
          styles.startLearningBtn,
          isHovered && styles.startLearningBtnHover
        ]}
      >
        <View style={styles.startLearningInner}>
          <Text style={styles.startLearningText}>BẮT ĐẦU</Text>
          <Animated.View style={[
            styles.startLearningIcon,
            { transform: [{ translateX: iconTranslate }] }
          ]}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Animated.View>

          {/* Shine effect */}
          {isHovered && (
            <Animated.View
              style={[
                styles.shineEffect,
                { transform: [{ translateX: shineTranslateX }] }
              ]}
            />
          )}
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
  const [isStudyHovered, setIsStudyHovered] = useState(false)

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
          <TouchableOpacity
            style={styles.heroInfoBtn}
            onPress={() => setShowInstructions(!showInstructions)}
          >
            <InfoIcon />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroVisual}>
              <Image source={DefaultBunny} style={styles.heroRabbitImage} resizeMode="contain" />
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
                style={[
                  styles.secondaryStudyBtn,
                  isStudyHovered && styles.secondaryStudyBtnHover
                ]}
                onPress={onStartStudy}
                onMouseEnter={() => setIsStudyHovered(true)}
                onMouseLeave={() => setIsStudyHovered(false)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}>
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke={isStudyHovered ? "#1F1F1F" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 17L12 22L22 17" stroke={isStudyHovered ? "#1F1F1F" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 12L12 17L22 12" stroke={isStudyHovered ? "#1F1F1F" : "#64748B"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <Text style={[
                  styles.secondaryStudyText,
                  isStudyHovered && styles.secondaryStudyTextHover
                ]}>Học Flashcard</Text>
              </TouchableOpacity>
            </View>
          </View>

          {showInstructions && (
            <View style={styles.heroInstructions}>
              <View style={styles.infoDivider} />
              <Text style={styles.heroInstrTitle}>Phương pháp học Flashcard</Text>
              <Text style={styles.heroInstrText}>
                Từ vựng sẽ được chia thành các nhóm nhỏ để bạn dễ dàng ghi nhớ.{'\n'}
                • <Text style={{ fontWeight: '700' }}>Bước 1:</Text> Nhìn thẻ flashcard, xem hình ảnh và nghe phát âm.{'\n'}
                • <Text style={{ fontWeight: '700' }}>Bước 2:</Text> Nghe và gõ lại từ vựng.{'\n'}
                • <Text style={{ fontWeight: '700' }}>Bước 3:</Text> Nhìn nghĩa tiếng Việt và gõ lại từ tiếng Anh tương ứng.
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={[styles.mainContent, { flex: 1, overflow: 'hidden' }]}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 30, gap: 24, flexGrow: 1 }}
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
              <Image source={DefaultBunny} style={styles.emptyImage} resizeMode="contain" />
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
    maxWidth: 1200,
    alignSelf: 'center',
    gap: 8,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    position: 'relative',
  },
  heroInfoBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    zIndex: 20,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  heroVisual: {
    width: 120,
    height: 120,
    backgroundColor: '#FFF9EB',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFF',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  sparkleBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
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
    width: 100,
    height: 100,
  },
  heroMain: {
    flex: 1,
    gap: 12,
  },
  heroTextContent: {
    gap: 6,
  },
  heroHeading: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  heroSubHeading: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    maxWidth: 380,
  },
  heroAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  secondaryStudyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    gap: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }),
  },
  secondaryStudyBtnHover: {
    backgroundColor: '#E2E8F0',
    filter: 'brightness(1.02)',
  },
  secondaryStudyText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
    transition: 'color 0.3s ease',
  },
  secondaryStudyTextHover: {
    color: '#1F1F1F',
  },
  startLearningBtn: {
    backgroundColor: '#fbbf24', // amber-400
    borderRadius: 16,
    shadowColor: '#fbbf24',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }),
  },
  startLearningInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    gap: 12,
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  startLearningBtnHover: {
    backgroundColor: '#f59e0b', // amber-500
    shadowOpacity: 0.5,
  },
  startLearningText: {
    color: '#451a03', // amber-950
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    zIndex: 10,
  },
  startLearningIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // white/30
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '100%',
    zIndex: 5,
    ...(Platform.OS === 'web' && {
      backgroundImage: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
    }),
  },
  heroInstructions: {
    marginTop: 20,
    width: '100%',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 20,
    width: '100%',
  },
  heroInstrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F1F1F',
    marginBottom: 8,
  },
  heroInstrText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  mainContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  vocabCard: {
    width: 'calc(33.333% - 14px)',
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1.5,
    borderColor: '#F1F5F9',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)'
    }),
  },
  vocabCardHover: {
    shadowColor: '#F1BE4B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderColor: '#F1BE4B80',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      filter: 'brightness(1.02)',
    }),
  },
  vocabImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
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
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  audioBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  favoriteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF1F1', // Light red background for favorite
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  vocabPronunciation: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  vocabMeaning: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
  },
  errorContainer: {
    padding: 60,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF4D4F',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontWeight: '700',
  },
  emptyContainer: {
    width: '100%',
    padding: 80,
    alignItems: 'center',
    gap: 12,
  },
  emptyImage: {
    width: 180,
    height: 180,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1F1F',
    marginTop: 12,
  },
})
