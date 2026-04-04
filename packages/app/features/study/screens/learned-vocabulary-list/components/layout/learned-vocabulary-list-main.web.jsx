import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image, ActivityIndicator } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import RabbitWaitingImage from 'assets/bunny/2.png'
import { LearnedSuperButton } from '../../../../components/learned-super-button.web'


const SoundIcon = ({ color = "#F1BE4B" }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" fill={color} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M15.54 8.46C16.4773 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4773 14.6024 15.54 15.54" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#666" strokeWidth="2" />
    <path d="M12 16V12" stroke="#666" strokeWidth="2" strokeLinecap="round" />
    <path d="M12 8H12.01" stroke="#666" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

/**
 * MasteryIndicator: Hiển thị mức độ ghi nhớ (Box Level)
 */
const MasteryIndicator = ({ level = 1 }) => {
  const maxLevel = 5
  return (
    <View style={styles.masteryContainer}>
      <View style={styles.masteryDots}>
        {[...Array(maxLevel)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.masteryDot,
              i < level ? styles.masteryDotActive : styles.masteryDotInactive
            ]}
          />
        ))}
      </View>
      <Text style={styles.masteryText}>Cấp {level}</Text>
    </View>
  )
}

/**
 * VocabCard: Component hiển thị từng từ vựng trong danh sách
 */
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
          source={vocab.imageUrl ? { uri: vocab.imageUrl } : RabbitWaitingImage}
          style={styles.vocabImage}
          resizeMode="cover"
        />
      </View>

      <View style={styles.vocabInfo}>
        <View style={styles.vocabHeaderLine}>
          <Text style={styles.vocabWord}>{vocab.word}</Text>
          {vocab.audioUrl && (
            <TouchableOpacity onPress={() => playAudio(vocab.audioUrl)} style={styles.audioBtn}>
              <SoundIcon />
            </TouchableOpacity>
          )}
        </View>

        {vocab.pronunciation && (
          <Text style={styles.vocabPronunciation}>/{vocab.pronunciation}/</Text>
        )}

        <Text style={styles.vocabMeaning} numberOfLines={2}>{vocab.meaning}</Text>

        <View style={styles.vocabFooter}>
          <MasteryIndicator level={vocab.boxLevel} />
          {vocab.streak > 0 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {vocab.streak}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

/**
 * LearnedVocabularyListMain (Web): Nội dung chính của trang danh sách từ vựng đã học trên web
 */
export function LearnedVocabularyListMain({
  title = 'Từ vựng đã học',
  vocabularies = [],
  loading,
  isInitialLoading,
  error,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onBackPress,
  onRetry,
  pageNumber,
  totalPages,
  canNextPage,
  canPrevPage,
  onPrevPage,
  onNextPage,
  reviewCount = 0,
  practiceCount = 20,
  onPracticeCountChange,
  maxPracticeCount = 0,
  onStartPractice,
}) {
  const [showInstructions, setShowInstructions] = useState(false)

  // Render loading state chỉ khi là lần load đầu tiên
  if (isInitialLoading && loading) {
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

  // Render error state
  if (error && vocabularies.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      {/* Hero Practice Banner */}
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
              <Image source={RabbitWaitingImage} style={styles.heroRabbitImage} resizeMode="contain" />
            </View>

            <View style={styles.heroMain}>
              <View style={styles.heroTextContent}>
                <Text style={styles.heroHeading}>
                  {reviewCount > 0
                    ? `Bạn có ${reviewCount} từ vựng cần ôn tập!`
                    : 'Trí nhớ của bạn đang rất tốt!'}
                </Text>
                <Text style={styles.heroSubHeading}>
                  Duy trì thói quen học mỗi ngày để đạt hiệu quả cao nhất.
                </Text>

                <View style={styles.practiceSettings}>
                  <Text style={styles.settingsLabel}>Số lượng ôn tập:</Text>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.countInput}
                      value={practiceCount.toString()}
                      onChangeText={(text) => {
                        if (text === '') {
                          onPracticeCountChange(1)
                          return
                        }
                        const num = parseInt(text, 10)
                        if (!isNaN(num) && num > 0) {
                          onPracticeCountChange(Math.min(num, maxPracticeCount))
                        }
                      }}
                      keyboardType="numeric"
                    />
                    <Text style={styles.maxLabel}>/ {maxPracticeCount}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.heroAction}>
              <LearnedSuperButton onPress={onStartPractice} />
            </View>
          </View>

          {/* Collapsible Instructions Inside Banner */}
          {showInstructions && (
            <View style={styles.heroInstructions}>
              <View style={styles.infoDivider} />
              <Text style={styles.heroInstrTitle}>Phương pháp lặp lại ngắt quãng (Spaced Repetition)</Text>
              <Text style={styles.heroInstrText}>
                Hệ thống Tokki sẽ tự động sắp xếp các từ vựng cần ôn tập dựa trên mức độ ghi nhớ của bạn. {'\n'}
                • <Text style={{ fontWeight: '700' }}>Cấp 1-2:</Text> Từ mới hoặc hay quên, cần ôn tập thường xuyên.{'\n'}
                • <Text style={{ fontWeight: '700' }}>Cấp 3-4:</Text> Đã nhớ khá tốt, thời gian giãn cách ôn tập lâu hơn.{'\n'}
                • <Text style={{ fontWeight: '700' }}>Cấp 5:</Text> Đã ghi nhớ bền vững, gần như không bao giờ quên.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Main Content: List */}
      <View style={styles.mainContent}>

        {vocabularies.length > 0 ? (
          <>
            <View style={styles.listGrid}>
              {vocabularies.map((vocab) => (
                <VocabCard key={vocab.id} vocab={vocab} />
              ))}
            </View>

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  onPress={onPrevPage}
                  disabled={!canPrevPage}
                  style={[styles.pageBtn, !canPrevPage && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>Trước</Text>
                </TouchableOpacity>
                <Text style={styles.pageInfo}>Trang {pageNumber} / {totalPages}</Text>
                <TouchableOpacity
                  onPress={onNextPage}
                  disabled={!canNextPage}
                  style={[styles.pageBtn, !canNextPage && styles.pageBtnDisabled]}
                >
                  <Text style={styles.pageBtnText}>Tiếp</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        ) : (
          !loading && (
            <View style={styles.emptyContainer}>
              <Image source={RabbitWaitingImage} style={styles.emptyImage} resizeMode="contain" />
              <Text style={styles.emptyTitle}>Hiện chưa có từ vựng đã học</Text>
              <Text style={styles.emptySubtitle}>Bạn vui lòng học thêm bài mới rồi quay lại nhé</Text>
            </View>
          )
        )}
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
    padding: 24,
    gap: 32,
  },
  headerSection: {
    width: '100%',
    gap: 16,
  },
  topActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
  },
  infoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
  practiceSettings: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  countInput: {
    width: 50,
    fontSize: 16,
    fontWeight: '700',
    color: '#F1BE4B',
    textAlign: 'center',
    backgroundColor: 'transparent',
    borderWidth: 0,
    outlineStyle: 'none',
  },
  maxLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  heroAction: {
    alignItems: 'flex-end',
  },
  mainContent: {
    gap: 24,
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
  vocabFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 12,
  },
  masteryContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  masteryDots: {
    flexDirection: 'row',
    gap: 3,
  },
  masteryDot: {
    width: 12,
    height: 4,
    borderRadius: 2,
  },
  masteryDotActive: {
    backgroundColor: '#4CAF50',
  },
  masteryDotInactive: {
    backgroundColor: '#E0E0E0',
  },
  masteryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4CAF50',
  },
  streakBadge: {
    backgroundColor: '#FFF0EE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF4D2D',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    width: '100%',
  },
  pageBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pageBtnDisabled: {
    opacity: 0.5,
  },
  pageBtnText: {
    fontWeight: '700',
    color: '#1F1F1F',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
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
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    maxWidth: 400,
  },
})
