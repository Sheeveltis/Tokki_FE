'use client'

import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Platform,
  Image,
  Pressable,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import RabbitWaitingImage from 'assets/bunny/2.png'
import { 
  fetchVocabularyDetailForUser, 
  fetchUserVocabularyExamples,
  addFavoriteVocabulary,
  removeFavoriteVocabulary,
  fetchFavorites
} from '../../api'

/**
 * Ant Design Style Heart Icon
 */
const HeartIcon = ({ filled = false, size = 22, color = '#FF4D4F' }) => (
  <View style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'} xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
        stroke={color} 
        strokeWidth="2" 
      />
    </svg>
  </View>
)

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * PulseSoundButton: Nút loa với hiệu ứng animation pulse cao cấp
 */
const PulseSoundButton = ({ onPlay, isPlaying }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start()
    } else {
      pulseAnim.stopAnimation()
      pulseAnim.setValue(1)
    }
  }, [isPlaying, pulseAnim])

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start()
    onPlay?.()
  }

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[
        styles.audioBtn,
        isPlaying && styles.audioBtnActive,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image
            source={normalizeImageSource(SoundIcon)}
            style={[styles.soundIcon, { tintColor: isPlaying ? '#FFF' : '#F1BE4B' }]}
            resizeMode="contain"
          />
        </Animated.View>
      </Animated.View>
    </Pressable>
  )
}

export function DictionaryVocabularyDetailScreen({ vocabularyId }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [vocabulary, setVocabulary] = useState(null)
  const [examples, setExamples] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFav, setLoadingFav] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!vocabularyId) {
      setError('ID từ vựng không khả dụng.')
      setLoading(false)
      return
    }

    let isMounted = true
    const loadData = async () => {
      try {
        setLoading(true)
        const [data, exList, favList] = await Promise.all([
          fetchVocabularyDetailForUser(vocabularyId),
          fetchUserVocabularyExamples(vocabularyId),
          fetchFavorites({ pageSize: 1000 })
        ])
        if (isMounted) {
          setVocabulary(data)
          setExamples(Array.isArray(exList) ? exList : [])
          
          // Check if current vocab is in favorites
          const exists = favList.some(item => 
            (item.vocabularyId === vocabularyId) || (item.id === vocabularyId)
          )
          setIsFavorite(exists)
        }
      } catch (e) {
        console.error('Error loading vocab detail:', e)
        if (isMounted) setError('Không thể tải dữ liệu từ vựng.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [vocabularyId])

  const toggleFavorite = async () => {
    if (!vocabulary || loadingFav) return
    
    setLoadingFav(true)
    try {
      if (isFavorite) {
        await removeFavoriteVocabulary(vocabularyId)
        setIsFavorite(false)
      } else {
        await addFavoriteVocabulary(vocabularyId)
        setIsFavorite(true)
      }
    } catch (e) {
      console.error('Toggle favorite failed:', e)
    } finally {
      setLoadingFav(false)
    }
  }

  const playAudio = (url) => {
    if (!url) return
    if (audioRef.current) {
      audioRef.current.pause()
    }
    const audio = new Audio(url)
    audioRef.current = audio
    setIsPlaying(true)
    audio.play()
    audio.onended = () => setIsPlaying(false)
  }

  if (loading) {
    return (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator color="#F1BE4B" size="large" />
      </View>
    )
  }

  if (error || !vocabulary) {
    return (
      <View style={styles.errorWrapper}>
        <Image source={RabbitWaitingImage} style={styles.errorRabbit} />
        <Text style={styles.errorMsg}>{error || 'Không tìm thấy từ vựng.'}</Text>
        <TouchableOpacity style={styles.backLink} onPress={() => router.push('/dictionary')}>
          <Text style={styles.backLinkText}>Quay lại từ điển</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.unifiedCard}>
        {/* Navigation Area */}
        <View style={styles.navHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/dictionary')}>
            <ArrowIcon width={18} height={18} style={{ transform: [{ rotate: '180deg' }], tintColor: '#999' }} />
            <Text style={styles.backBtnLabel}>Quay lại</Text>
          </TouchableOpacity>
          <NavigationPill
            items={[
              { label: 'Từ điển', onPress: () => router.push('/dictionary') },
              { label: vocabulary.text || 'Chi tiết' },
            ]}
          />
        </View>

        {/* Word Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.wordHeader}>
            <View style={styles.wordTitleRow}>
              <View>
                <Text style={styles.mainWord}>{vocabulary.text}</Text>
                {!!vocabulary.pronunciation && (
                  <Text style={styles.pronunciation}>/{vocabulary.pronunciation}/</Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.favBtn, isFavorite && styles.favBtnActive]}
                onPress={toggleFavorite}
                disabled={loadingFav}
              >
                {loadingFav ? (
                  <ActivityIndicator size="small" color={isFavorite ? '#FFF' : '#FF4D4F'} />
                ) : (
                  <HeartIcon filled={isFavorite} color={isFavorite ? '#FFF' : '#FF4D4F'} />
                )}
              </TouchableOpacity>
            </View>

            <PulseSoundButton 
              isPlaying={isPlaying} 
              onPlay={() => playAudio(vocabulary.audioURL)} 
            />
          </View>

          <View style={styles.meaningBox}>
            <Text style={styles.label}>Nghĩa tiếng Việt</Text>
            <Text style={styles.meaningText}>{vocabulary.definition}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Content Body */}
        <View style={styles.contentBody}>
          <View style={styles.bodyRow}>
            {/* Left: Illustration */}
            <View style={styles.bodyColLeft}>
              <Text style={styles.label}>Hình ảnh</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={vocabulary.imgURL ? { uri: vocabulary.imgURL } : RabbitWaitingImage}
                  style={styles.illustration}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Right: Examples */}
            <View style={styles.bodyColRight}>
              <Text style={styles.label}>Ví dụ thực tế</Text>
              <View style={styles.examplesList}>
                {examples.length > 0 ? (
                  examples.map((ex, i) => (
                    <View key={i} style={styles.exampleItem}>
                      <View style={styles.exampleHeader}>
                        <View style={styles.dot} />
                        <Text style={styles.exSentence}>{ex.sentence}</Text>
                      </View>
                      <Text style={styles.exTranslation}>{ex.translation}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyExamples}>
                    <Text style={styles.emptyText}>Chưa có ví dụ nào cho từ vựng này.</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Subtle Decoration */}
        <View style={styles.rabbitDecor}>
          <Image source={RabbitWaitingImage} style={styles.decorImage} />
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  loadingWrapper: {
    padding: 100,
    alignItems: 'center',
  },
  errorWrapper: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  errorRabbit: {
    width: 140,
    height: 140,
    opacity: 0.8,
  },
  errorMsg: {
    fontSize: 16,
    color: '#FF4D4F',
    fontWeight: '700',
  },
  backLink: {
    padding: 12,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
  },
  backLinkText: {
    color: '#FFF',
    fontWeight: '700',
  },
  unifiedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
  },
  navHeader: {
    paddingtop: 32,
    paddingHorizontal: 32,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F8F8F8',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  backBtnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
  },
  heroSection: {
    padding: 32,
    gap: 24,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  wordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  favBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FF4D4F20',
    shadowColor: '#FF4D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  favBtnActive: {
    backgroundColor: '#FF4D4F',
    borderColor: '#FF4D4F',
    shadowOpacity: 0.3,
  },
  mainWord: {
    fontSize: 52,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -1.5,
  },
  pronunciation: {
    fontSize: 20,
    color: '#F1BE4B',
    fontWeight: '700',
    marginTop: 4,
  },
  audioBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F1BE4B30',
  },
  audioBtnActive: {
    backgroundColor: '#F1BE4B',
  },
  soundIcon: {
    width: 24,
    height: 24,
  },
  meaningBox: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 24,
    borderLeftWidth: 6,
    borderLeftColor: '#F1BE4B',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CCC',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  meaningText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 30,
  },
  divider: {
    height: 1,
    backgroundColor: '#F8F8F8',
    marginHorizontal: 32,
  },
  contentBody: {
    padding: 32,
  },
  bodyRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 32,
  },
  bodyColLeft: {
    flex: 1,
  },
  bodyColRight: {
    flex: 1.5,
  },
  imageContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  examplesList: {
    gap: 16,
  },
  exampleItem: {
    backgroundColor: '#FCFCFC',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  exampleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F1BE4B',
  },
  exSentence: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  exTranslation: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    paddingLeft: 14,
  },
  emptyExamples: {
    padding: 30,
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#DDD',
    alignItems: 'center',
  },
  emptyText: {
    color: '#BBB',
    fontSize: 13,
    fontWeight: '500',
  },
  rabbitDecor: {
    alignItems: 'flex-end',
    paddingRight: 20,
    paddingBottom: 20,
    marginTop: -40,
    pointerEvents: 'none',
  },
  decorImage: {
    width: 140,
    height: 140,
    opacity: 0.1,
  },
})

export default DictionaryVocabularyDetailScreen
