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
      <View style={styles.searchSection}>
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
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Các chủ đề đang học</Text>
          <View style={styles.sectionDivider} />
        </View>
        
        <View style={styles.gridContainer}>
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
  searchSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    maxWidth: 800,
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }),
  },
  searchInputWrapper: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
    fontSize: 15,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1A1A1A',
    outlineStyle: 'none',
  },
  searchInputLoading: {
    paddingRight: 40,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }],
    width: 20,
    height: 20,
  },
  searchButton: {
    paddingHorizontal: 24,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  listContainer: {
    width: '100%',
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
  },
  gridContainer: {
    width: '100%',
    gap: 20,
  },
  paginationContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  paginationButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),
  },
  paginationButtonPressed: {
    backgroundColor: '#FAFAFA',
    transform: [{ translateY: 1 }],
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    ...(Platform.OS === 'web' && {
      cursor: 'not-allowed',
    }),
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 32,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      boxShadow: '0 8px 20px rgba(241,190,75,0.2)',
    }),
  },
  retryButtonText: {
    color: '#1A1A1A',
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

