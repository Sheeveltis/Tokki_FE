import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image } from 'react-native'
import { FlashcardTopicCard } from '../../../components/shared'
import { NavigationPill } from '../../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../../../../../../assets/icon/icon-mainflow/star.svg'
import BookIcon from '../../../../../../assets/icon/navigate-app/book.svg'
import { normalizeImageSource } from '../../../api'
import { studyStyles } from '../../../styles'
import { LoadingWithContainer } from '../../../../../../components/Loading'

/**
 * FlashcardListMain (Mobile): Nội dung chính của trang danh sách flashcard trên mobile
 */
export function FlashcardListMain({
  title,
  topics,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  selectedLevel,
  onLevelChange,
  onBackPress,
  onTopicPress,
  onRetry,
  onFavoritesPress,
  onLearnedPress,
  pageNumber,
  canNextPage,
  onPrevPage,
  onNextPage,
}) {
  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingWithContainer
          size={48}
          color="#F1BE4B"
          shadowColor="#F1BE4B50"
          text="Đang tải danh sách chủ đề..."
        />
      </View>
    )
  }

  // Render error state
  if (error && topics.length === 0) {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.backBtn}>
            <NavigationPill
              label="Quay lại"
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
        {(onFavoritesPress || onLearnedPress) && (
          <View style={styles.headerButtons}>
            {onFavoritesPress ? (
              <Pressable style={styles.favoritesButton} onPress={onFavoritesPress}>
                <Image
                  source={normalizeImageSource(StarIcon)}
                  style={styles.favoritesIcon}
                  resizeMode="contain"
                />
                <Text style={styles.favoritesButtonText}>Yêu thích</Text>
              </Pressable>
            ) : null}
            {onLearnedPress ? (
              <Pressable style={styles.learnedButton} onPress={onLearnedPress}>
                <Image
                  source={normalizeImageSource(BookIcon)}
                  style={styles.learnedIcon}
                  resizeMode="contain"
                />
                <Text style={styles.learnedButtonText}>Đã học</Text>
              </Pressable>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          value={searchTerm}
          placeholder="Tìm kiếm chủ đề..."
          onChangeText={onSearchChange}
          onSubmitEditing={onSearchSubmit}
          style={styles.searchInput}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={onSearchSubmit}>
          <Text style={styles.searchButtonText}>Tìm</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        {topics.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có chủ đề flashcard nào</Text>
          </View>
        ) : (
          topics.map((topic) => (
            <FlashcardTopicCard
              key={topic.id}
              icon={topic.icon}
              title={topic.title}
              subtitle={topic.subtitle}
              highlight={topic.highlight}
              muted={topic.muted}
              badgeText={topic.isLearned ? 'Đã học' : undefined}
              showBadge={Boolean(topic.isLearned)}
              onPress={() => onTopicPress?.(topic)}
              compact={true}
            />
          ))
        )}
      </View>

      <View style={styles.paginationContainer}>
        <Pressable
          onPress={() => !loading && onPrevPage?.()}
          disabled={loading || pageNumber <= 1}
          style={({ pressed }) => [
            styles.paginationButton,
            (loading || pageNumber <= 1) && styles.paginationButtonDisabled,
            pressed && styles.paginationButtonPressed,
          ]}
        >
          <Text style={styles.paginationButtonText}>Trước</Text>
        </Pressable>

        <Text style={styles.paginationText}>Trang {pageNumber}</Text>

        <Pressable
          onPress={() => !loading && onNextPage?.()}
          disabled={loading || !canNextPage}
          style={({ pressed }) => [
            styles.paginationButton,
            (loading || !canNextPage) && styles.paginationButtonDisabled,
            pressed && styles.paginationButtonPressed,
          ]}
        >
          <Text style={styles.paginationButtonText}>Sau</Text>
        </Pressable>
      </View>

      <View style={styles.levelContainer}>
        {[1, 2, 3, 4, 5, 6].map((level) => {
          const isActive = Number(selectedLevel) === level
          return (
            <Pressable
              key={level}
              onPress={() => onLevelChange?.(level)}
              style={({ pressed }) => [
                styles.levelButton,
                isActive && styles.levelButtonActive,
                pressed && styles.levelButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  isActive && styles.levelButtonTextActive,
                ]}
              >
                {level}
              </Text>
            </Pressable>
          )
        })}
      </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  favoritesIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  favoritesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  learnedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  learnedIcon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  learnedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
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
  levelContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  levelButton: {
    minWidth: 36  ,
    height: 36,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'background-color, border-color, color',
      transitionDuration: '120ms',
    }),
  },
  levelButtonActive: {
    backgroundColor: '#1F1F1F',
    borderColor: '#D39A1C',
  },
  levelButtonPressed: {
    opacity: 0.85,
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  levelButtonTextActive: {
    color: '#1F1F1F',
  },
  listContainer: {
    width: '100%',
    gap: 0,
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
})

