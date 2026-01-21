import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image } from 'react-native'
import { NavigationPill } from '../../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'
import { normalizeImageSource } from '../../../api'

/**
 * LearnedVocabularyListMain (Mobile): Nội dung chính của trang danh sách từ vựng đã học trên mobile
 */
export function LearnedVocabularyListMain({
  title = 'Từ vựng đã học',
  vocabularies,
  loading,
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
  onStartPractice,
}) {
  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingWithContainer
          size={48}
          color="#F1BE4B"
          shadowColor="#F1BE4B50"
          text="Đang tải danh sách từ vựng..."
        />
      </View>
    )
  }

  // Render error state
  if (error && vocabularies.length === 0) {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.backBtn}>
            <NavigationPill
              label="Quay lại"
              icon={ArrowIcon}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
            />
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
        </View>
        <View style={styles.errorContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <>
      <View style={styles.header}>
        <View style={styles.backBtn}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        {title ? <Text style={styles.title}>{title}</Text> : null}
      </View>

      {/* Instructions Box */}
      {vocabularies.length > 0 && (
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>Hướng dẫn về chế độ học này</Text>
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsText}>
              Đây là nơi để bạn ôn lại từ vựng đã học, giúp bạn ghi nhớ từ vựng một cách bền vững theo thời gian thông qua phương pháp nhắc lại có chủ đích.{'\n\n'}
              Mỗi ngày hệ thống sẽ tự động tạo danh sách từ vựng cần ôn tập dựa trên lịch sử học của bạn. Hãy nhớ vào học thường xuyên để đạt hiệu quả tốt nhất nhé!
            </Text>
          </View>
          <Text style={styles.instructionsTitle}>Cách ôn tập</Text>
          <View style={styles.instructionsContent}>
            <Text style={styles.instructionsText}>
              Có 2 chế độ ôn tập được hệ thống chọn ngẫu nhiên: (1) Nghe và viết lại từ, (2) Đọc nghĩa và viết lại từ.{'\n'}
              Bạn chỉ cần làm lần lượt cho đến khi hết danh sách — trả lời sai vẫn tiếp tục để giữ nhịp học.{'\n'}
              Mỗi ngày sẽ có ngẫu nhiên 20 từ vựng để bạn ôn lại.{'\n\n'}
              Tokki chúc bạn học thật tốt nhé.
            </Text>
          </View>
        </View>
      )}

      {/* Practice Banner */}
      {vocabularies.length > 0 ? (
        <View style={styles.practiceBanner}>
          <View style={styles.practiceBannerContent}>
            <Text style={styles.practiceBannerText}>
              {reviewCount > 0 
                ? `Bạn có ${reviewCount} từ vựng cần ôn tập`
                : 'Bắt đầu học từ vựng'}
            </Text>
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
  loadingContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  title: {
    ...studyStyles.pageTitle,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1BE4B',
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  paginationContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paginationButtonPressed: {
    opacity: 0.85,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  listContainer: {
    width: '100%',
    gap: 12,
    paddingHorizontal: 16,
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
  },
  vocabImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  vocabContent: {
    flex: 1,
    gap: 6,
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  vocabMeaning: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
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
    width: '100%',
    backgroundColor: '#FFF4E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1BE4B',
  },
  practiceBannerContent: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  practiceBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  practiceButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
  },
  practiceButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: '#E8F4FD',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#B3D9F2',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 10,
  },
  instructionsContent: {
    gap: 6,
  },
  instructionsText: {
    fontSize: 13,
    fontWeight: '400',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
})

