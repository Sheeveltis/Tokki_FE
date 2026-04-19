import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, Image, Platform, ScrollView } from 'react-native'
import { LoadingWithContainer } from 'components/Loading'
import { getFlashcardsByTopic } from '@tokki/app/features/study/api'
import DefaultBunny from 'assets/bunny/14.png'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ButtonUI1 from 'components/decor/buttonUI1'

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

  const playAudio = (url) => {
    if (!url) return
    const audio = new Audio(url)
    audio.play()
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
          {vocab.audioUrl && (
            <TouchableOpacity onPress={() => playAudio(vocab.audioUrl)} style={styles.audioBtn}>
              <StudyIcon source={SoundIcon} width={20} height={20} tintColor="#F1BE4B" />
            </TouchableOpacity>
          )}
        </View>

        {vocab.pronunciation && (
          <Text style={styles.vocabPronunciation}>/{vocab.pronunciation}/</Text>
        )}

        <Text style={styles.vocabMeaning} numberOfLines={2}>{vocab.meaning}</Text>
      </View>
    </View>
  )
}

// Bắt chước nút "Học siêu cấp" nhưng là "Bắt đầu học"
const StartLearningButton = ({ onPress }) => {
  return (
    <ButtonUI1 onClick={onPress}>
      Bắt đầu
    </ButtonUI1>
  )
}

export function FlashcardFirstLearnList({
  topicId,
  onStartLearning
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
          <TouchableOpacity
            style={styles.heroInfoBtn}
            onPress={() => setShowInstructions(!showInstructions)}
          >
            <InfoIcon />
          </TouchableOpacity>

          <View style={styles.heroContent}>
            <View style={styles.heroVisual}>
              <Image source={DefaultBunny} style={styles.heroRabbitImage} resizeMode="contain" />
            </View>

            <View style={styles.heroMain}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroHeading}>
                  Bạn có {vocabularies.length} từ vựng cần học!
                </Text>
                <Text style={styles.heroSubHeading}>
                  Chinh phục toàn bộ từ vựng trong chủ đề này nhé.
                </Text>
              </View>
            </View>

            <View style={styles.heroAction}>
              <StartLearningButton onPress={onStartLearning} />
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
    gap: 16,
  },
  heroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
    width: 140,
    height: 140,
    backgroundColor: '#FFF9EB',
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: '#FFF',
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
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
  },
  heroSubHeading: {
    fontSize: 15,
    color: '#666',
    marginBottom: 12,
  },
  heroAction: {
    alignItems: 'flex-end',
  },
  startLearnButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    transform: [{ scale: 1 }],
    transition: 'all 0.2s ease',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  startLearnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
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
    borderRadius: 24,
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
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    transition: 'all 0.25s ease',
  },
  vocabCardHover: {
    transform: 'translateY(-5px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderColor: '#F1BE4B50',
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
