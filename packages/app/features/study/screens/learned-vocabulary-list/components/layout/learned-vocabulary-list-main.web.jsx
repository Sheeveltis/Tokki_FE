import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import { normalizeImageSource } from '@tokki/app/features/study/api'

/**
 * LearnedVocabularyListMain (Web): Nội dung chính của trang danh sách từ vựng đã học trên web
 */
export function LearnedVocabularyListMain({
  title = 'Từ vựng đã học',
  vocabularies,
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
  // Render loading state chỉ khi là lần load đầu tiên
  if (isInitialLoading && loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải danh sách từ vựng..."
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  // Render error state
  if (error && vocabularies.length === 0) {
    return (
      <View style={styles.errorContainer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <>

      {/* Instructions Box */}
      {vocabularies.length > 0 && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>Hướng dẫn về chế độ học này</Text>
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsText}>
              Đây là nơi để bạn ôn lại từ vựng đã học, giúp bạn ghi nhớ từ vựng một cách bền vững theo thời gian thông qua phương pháp nhắc lại có chủ đích.{'\n'}
              Mỗi ngày hệ thống sẽ tự động tạo danh sách từ vựng cần ôn tập dựa trên lịch sử học của bạn. Hãy nhớ vào học thường xuyên để đạt hiệu quả tốt nhất nhé!
            </Text>
          </View>
          <Text style={styles.instructionsTitle}>{'\n'}Cách ôn tập</Text>
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsText}>
              Có 2 chế độ ôn tập được hệ thống chọn ngẫu nhiên: (1) Nghe và viết lại từ, (2) Đọc nghĩa và viết lại từ.{'\n'}
              Bạn chỉ cần làm lần lượt cho đến khi hết danh sách — trả lời sai vẫn tiếp tục để giữ nhịp học.{'\n'}
              Bạn có thể chọn số lượng từ vựng muốn học mỗi lần ôn tập.{'\n\n'}
              Tokki chúc bạn học thật tốt nhé.
            </Text>
          </View>
        </View>
      )}

      {/* Practice Banner */}
      {vocabularies.length > 0 ? (
        <View style={styles.practiceBanner}>
          <View style={styles.practiceBannerContent}>
            <View style={styles.practiceBannerLeft}>
              <Text style={styles.practiceBannerText}>
                {reviewCount > 0 
                  ? `Bạn có ${reviewCount} từ vựng cần ôn tập`
                  : 'Bắt đầu học từ vựng'}
              </Text>
              <View style={styles.practiceCountSelector}>
                <Text style={styles.practiceCountLabel}>Số lượng từ muốn học:</Text>
                <View style={styles.practiceCountInputWrapper}>
                  <TextInput
                    style={styles.practiceCountInput}
                    value={practiceCount.toString()}
                    onChangeText={(text) => {
                      if (text === '') {
                        onPracticeCountChange(1)
                        return
                      }
                      const num = parseInt(text, 10)
                      if (!isNaN(num) && num > 0) {
                        // Giới hạn tối đa là maxPracticeCount
                        const finalNum = Math.min(num, maxPracticeCount)
                        onPracticeCountChange(finalNum)
                      }
                    }}
                    keyboardType="numeric"
                    maxLength={4}
                  />
                  <Text style={styles.practiceCountMax}>/ {maxPracticeCount}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.practiceButton}
              onPress={onStartPractice}
            >
              <Text style={styles.practiceButtonText}>
                {reviewCount > 0 ? 'Bắt đầu ôn tập' : 'Bắt đầu học'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có từ vựng đã học nào</Text>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  backBtn: {
    flexShrink: 0,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 12,
  },
  title: {
    ...studyStyles.pageTitle,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '90%',
    maxWidth: 900,
    marginTop: 8,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    height: 40,
    paddingHorizontal: 12,
    paddingRight: 12,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
  },
  searchInputLoading: {
    paddingRight: 40,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1BE4B',
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  paginationContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'opacity, background-color',
      transitionDuration: '120ms',
    }),
  },
  paginationButtonPressed: {
    opacity: 0.85,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  listContainer: {
    width: '90%',
    maxWidth: 1200,
    gap: 16,
  },
  vocabCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'box-shadow, transform',
      transitionDuration: '150ms',
    }),
  },
  vocabImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  vocabContent: {
    flex: 1,
    gap: 8,
  },
  vocabWord: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  vocabMeaning: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 200,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4d4f',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  retryButtonText: {
    color: '#1F1F1F',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  practiceBanner: {
    width: '90%',
    maxWidth: 1200,
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1BE4B',
  },
  practiceBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  practiceBannerLeft: {
    flex: 1,
    gap: 12,
  },
  practiceBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  practiceCountSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  practiceCountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  practiceCountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  practiceCountInput: {
    width: 80,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  practiceCountMax: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  practiceButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'opacity, transform',
      transitionDuration: '150ms',
    }),
  },
  practiceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionsBox: {
    width: '90%',
    maxWidth: 1200,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 12,
  },
  instructionsContent: {
    gap: 8,
  },
  instructionsText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
  },
})

