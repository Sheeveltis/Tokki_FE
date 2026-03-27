import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform } from 'react-native'
import { FlashcardTopicCard } from '@tokki/app/features/study/components/shared'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'

/**
 * FlashcardListMain (Web): Nội dung chính của trang danh sách flashcard trên web
 */
export function FlashcardListMain({
  title,
  topics,
  loading,
  isInitialLoading,
  error,
  searchTerm,
  onSearchChange,
  onSearchSubmit,
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
  // Render loading state chỉ khi là lần load đầu tiên
  if (isInitialLoading && loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải danh sách chủ đề..."
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    )
  }

  // Render error state
  if (error && topics.length === 0) {
    return (
      <>
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
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <TextInput
            value={searchTerm}
            placeholder="Tìm kiếm chủ đề..."
            onChangeText={onSearchChange}
            onSubmitEditing={onSearchSubmit}
            style={[
              styles.searchInput,
              loading && !isInitialLoading && styles.searchInputLoading,
            ]}
            returnKeyType="search"
            editable={!loading}
          />
          {loading && !isInitialLoading ? (
            <View style={styles.loadingIndicator}>
              <LoadingWithContainer
                size={20}
                color="#F1BE4B"
                shadowColor="#F1BE4B50"
                text=""
              />
            </View>
          ) : null}
        </View>
        <TouchableOpacity 
          style={[styles.searchButton, loading && styles.searchButtonDisabled]} 
          onPress={onSearchSubmit}
          disabled={loading}
        >
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
              progress={topic.progress ?? 0}
              showBadge={true}
              onPress={() => onTopicPress?.(topic)}
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
    </>
  )
}

const styles = StyleSheet.create({
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  learnedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
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
    fontFamily: 'Epilogue, sans-serif',
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
    fontFamily: 'Epilogue, sans-serif',
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
  levelSelectContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  levelSelectLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelSelectMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  levelButton: {
    minWidth: 36,
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
    backgroundColor: '#F1BE4B',
    borderColor: '#D39A1C',
  },
  levelButtonPressed: {
    opacity: 0.85,
  },
  levelButtonDisabled: {
    opacity: 0.6,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelButtonTextActive: {
    color: '#1F1F1F',
  },
  listContainer: {
    width: '100%',
    maxWidth: '100%',
    gap: 30,
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

