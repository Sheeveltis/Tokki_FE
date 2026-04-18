import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image, Modal, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { FlashcardTopicCard } from '@tokki/app/features/study/components/shared'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import BookIcon from 'assets/icon/navigate-app/book.svg'
import SearchIcon from 'assets/icon/navigate-app/search.svg'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'

const StarSVG = ({ size, fill = "#FFD700" }) => (
  <Text style={{ fontSize: size, color: fill, includeFontPadding: false, lineHeight: size }}>✦</Text>
)

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
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState('')

  const levels = [
    { id: null, label: 'Tất cả' },
    { id: 1, label: 'TOPIK 1' },
    { id: 2, label: 'TOPIK 2' },
    { id: 3, label: 'TOPIK 3' },
    { id: 4, label: 'TOPIK 4' },
    { id: 5, label: 'TOPIK 5' },
    { id: 6, label: 'TOPIK 6' },
  ]

  // Helper function để render icon (hỗ trợ cả SVG component và image source)
  const renderIcon = (IconComponent, style) => {
    if (!IconComponent) return null

    // Kiểm tra xem có phải là React component không (SVG component)
    const isReactComponent = IconComponent && (
      (typeof IconComponent === 'function') ||
      (typeof IconComponent === 'object' && IconComponent.$$typeof) ||
      (typeof IconComponent === 'object' && IconComponent.default && (typeof IconComponent.default === 'function' || IconComponent.default.$$typeof))
    )

    if (isReactComponent) {
      // Render như React component (SVG)
      // Loại bỏ tintColor và resizeMode khỏi style vì SVG không hỗ trợ
      const { tintColor, resizeMode, ...svgStyle } = style || {}
      const Component = typeof IconComponent === 'function' ? IconComponent : (IconComponent.default || IconComponent)
      const width = svgStyle?.width || 20
      const height = svgStyle?.height || 20
      return (
        <View style={[{ width, height, alignItems: 'center', justifyContent: 'center' }, svgStyle]}>
          <Component width={width} height={height} fill={tintColor} color={tintColor} />
        </View>
      )
    }

    // Fallback: thử dùng Image với normalizeImageSource
    const iconSource = normalizeImageSource(IconComponent)
    if (iconSource) {
      return <Image source={iconSource} style={style} resizeMode="contain" />
    }

    return null
  }
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
          <View style={styles.headerTop}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            <Pressable
              style={styles.searchIconButton}
              onPress={() => {
                setLocalSearchTerm(searchTerm || '')
                setIsSearchVisible(true)
              }}
            >
              <View style={styles.searchIcon}>
                <SearchIcon width={24} height={24} />
              </View>
            </Pressable>
          </View>
        </View>
        <View style={styles.errorContainer}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
        <Modal
          visible={isSearchVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsSearchVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setIsSearchVisible(false)}
          >
            <Pressable
              style={styles.modalContent}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tìm kiếm</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsSearchVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalSearchContainer}>
                <TextInput
                  value={localSearchTerm}
                  placeholder="Tìm kiếm chủ đề..."
                  placeholderTextColor="#999"
                  onChangeText={setLocalSearchTerm}
                  onSubmitEditing={() => {
                    onSearchChange?.(localSearchTerm)
                    onSearchSubmit?.()
                    setIsSearchVisible(false)
                  }}
                  style={styles.modalSearchInput}
                  returnKeyType="search"
                  autoFocus={true}
                />
                <TouchableOpacity
                  style={styles.modalSearchButton}
                  onPress={() => {
                    onSearchChange?.(localSearchTerm)
                    onSearchSubmit?.()
                    setIsSearchVisible(false)
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalSearchButtonText}>Tìm</Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Pressable
            style={styles.searchIconButton}
            onPress={() => {
              setLocalSearchTerm(searchTerm || '')
              setIsSearchVisible(true)
            }}
          >
            <View style={styles.searchIcon}>
              <SearchIcon width={24} height={24} />
            </View>
          </Pressable>
        </View>
        {(onFavoritesPress || onLearnedPress) && (
          <View style={styles.headerButtons}>
            {onFavoritesPress ? (
              <Pressable style={styles.favoritesButton} onPress={onFavoritesPress}>
                {renderIcon(StarIcon, styles.favoritesIcon)}
                <Text style={styles.favoritesButtonText}>Từ vựng yêu thích</Text>
              </Pressable>
            ) : null}
            {onLearnedPress ? (
              <Pressable style={styles.learnedButtonWrapper} onPress={onLearnedPress}>
                <LinearGradient
                  colors={['#FF8E53', '#FE6B8B']}
                  start={{ x: 0.3, y: 0 }}
                  end={{ x: 0.9, y: 0 }}
                  style={styles.learnedButton}
                >
                  <View style={styles.learnedContent}>
                    {renderIcon(BookIcon, styles.learnedIcon)}
                    <Text style={styles.learnedButtonText}>Học siêu cấp</Text>
                  </View>
                  <View style={[styles.star, { top: '20%', left: '20%' }]}>
                    <StarSVG size={20} fill="#FFFFFF60" />
                  </View>
                  <View style={[styles.star, { top: '45%', left: '45%' }]}>
                    <StarSVG size={12} fill="#FFFFFF80" />
                  </View>
                  <View style={[styles.star, { top: '20%', left: '60%' }]}>
                    <StarSVG size={8} fill="#FFFFFF40" />
                  </View>
                  <View style={[styles.star, { top: '65%', left: '75%' }]}>
                    <StarSVG size={14} fill="#FFFFFF70" />
                  </View>
                </LinearGradient>
              </Pressable>
            ) : null}
          </View>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.levelSelectorContainer}
        >
          {levels.map((level) => (
            <TouchableOpacity
              key={String(level.id)}
              onPress={() => onLevelChange?.(level.id)}
              style={[
                styles.levelButton,
                selectedLevel === level.id && styles.levelButtonActive
              ]}
            >
              <Text
                style={[
                  styles.levelButtonText,
                  selectedLevel === level.id && styles.levelButtonTextActive
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={isSearchVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsSearchVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsSearchVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tìm kiếm</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsSearchVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalSearchContainer}>
              <TextInput
                value={localSearchTerm}
                placeholder="Tìm kiếm chủ đề..."
                placeholderTextColor="#999"
                onChangeText={setLocalSearchTerm}
                onSubmitEditing={() => {
                  onSearchChange?.(localSearchTerm)
                  onSearchSubmit?.()
                  setIsSearchVisible(false)
                }}
                style={styles.modalSearchInput}
                returnKeyType="search"
                autoFocus={true}
              />
              <TouchableOpacity
                style={styles.modalSearchButton}
                onPress={() => {
                  onSearchChange?.(localSearchTerm)
                  onSearchSubmit?.()
                  setIsSearchVisible(false)
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalSearchButtonText}>Tìm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
              vocabularyCount={topic.vocabularyCount}
              showBadge={true}
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 20,
  },
  scrollContent: {
    paddingBottom: 1,
  },
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
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 56,
  },
  title: {
    ...studyStyles.pageTitle,
    textAlign: 'center',
  },
  searchIconButton: {
    position: 'absolute',
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    width: 24,
    height: 24,
  },
  title: {
    ...studyStyles.pageTitle,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 8,
  },
  favoritesButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  favoritesIcon: {
    width: 20,
    height: 20,
  },
  favoritesButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    fontFamily: 'Epilogue, sans-serif',
  },
  learnedButtonWrapper: {
    flex: 1,
    borderRadius: 16,
    shadowColor: '#FE6B8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  learnedButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  learnedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
  },
  star: {
    position: 'absolute',
  },
  learnedIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  learnedButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    lineHeight: 20,
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  modalSearchInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: '#F8F8F8',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1F1F1F',
  },
  modalSearchButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F1BE4B',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchButtonText: {
    fontSize: 16,
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
    paddingHorizontal: 16,
    marginTop: 8,
    paddingBottom: 20,
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
  levelSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4, // for shadow clipping prevention
    marginBottom: 8,
  },
  levelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelButtonActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  levelButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 16,
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

