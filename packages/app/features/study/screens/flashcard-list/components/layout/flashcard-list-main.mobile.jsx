import React, { useState } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, Image, Modal } from 'react-native'
import { FlashcardTopicCard } from '../components/shared'
import { NavigationPill } from '../components/navigation-pill'
import ArrowIcon from '../assets/icon/icon-mainflow/arrow.svg'
import StarIcon from '../assets/icon/icon-mainflow/star.svg'
import BookIcon from '../assets/icon/navigate-app/book.svg'
import SearchIcon from '../assets/icon/navigate-app/search.svg'
import { normalizeImageSource } from '../api'
import { studyStyles } from '../styles'
import { LoadingWithContainer } from '../components/Loading'

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
          <Component width={width} height={height} />
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
            <View style={styles.backBtn}>
              <NavigationPill
                label="Quay lại"
                onPress={onBackPress}
                textStyle={{ fontWeight: '700' }}
              />
            </View>
            <Pressable 
              style={styles.searchIconButton}
              onPress={() => setIsSearchVisible(true)}
            >
              <View style={styles.searchIcon}>
                <SearchIcon width={24} height={24} />
              </View>
            </Pressable>
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
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
                  value={searchTerm}
                  placeholder="Tìm kiếm chủ đề..."
                  placeholderTextColor="#999"
                  onChangeText={onSearchChange}
                  onSubmitEditing={() => {
                    onSearchSubmit()
                    setIsSearchVisible(false)
                  }}
                  style={styles.modalSearchInput}
                  returnKeyType="search"
                  autoFocus={true}
                />
                <TouchableOpacity 
                  style={styles.modalSearchButton} 
                  onPress={() => {
                    onSearchSubmit()
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
    <>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.backBtn}>
            <NavigationPill
              label="Quay lại"
              icon={ArrowIcon}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
            />
          </View>
          <Pressable 
            style={styles.searchIconButton}
            onPress={() => setIsSearchVisible(true)}
          >
            <View style={styles.searchIcon}>
              <SearchIcon width={24} height={24} />
            </View>
          </Pressable>
        </View>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {(onFavoritesPress || onLearnedPress) && (
          <View style={styles.headerButtons}>
            {onFavoritesPress ? (
              <Pressable style={styles.favoritesButton} onPress={onFavoritesPress}>
                {renderIcon(StarIcon, styles.favoritesIcon)}
                <Text style={styles.favoritesButtonText}>Yêu thích</Text>
              </Pressable>
            ) : null}
            {onLearnedPress ? (
              <Pressable style={styles.learnedButton} onPress={onLearnedPress}>
                {renderIcon(BookIcon, styles.learnedIcon)}
                <Text style={styles.learnedButtonText}>Từ vựng đã học</Text>
              </Pressable>
            ) : null}
          </View>
        )}
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
                value={searchTerm}
                placeholder="Tìm kiếm chủ đề..."
                placeholderTextColor="#999"
                onChangeText={onSearchChange}
                onSubmitEditing={() => {
                  onSearchSubmit()
                  setIsSearchVisible(false)
                }}
                style={styles.modalSearchInput}
                returnKeyType="search"
                autoFocus={true}
              />
              <TouchableOpacity 
                style={styles.modalSearchButton} 
                onPress={() => {
                  onSearchSubmit()
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
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
    paddingVertical: 10,
  },
  backBtn: {
    flexShrink: 0,
  },
  searchIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#F1BE4B',
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

