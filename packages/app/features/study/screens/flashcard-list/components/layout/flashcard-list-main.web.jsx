import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Pressable, Platform, ScrollView, Image as RNImage } from 'react-native'
import { FlashcardTopicCard } from '@tokki/app/features/study/components/shared'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import SearchIcon from 'assets/icon/navigate-app/search.svg'
import { LoadingWithContainer } from 'components/Loading'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'

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
  selectedLevel,
  onLevelChange,
  onBackPress,
  onTopicPress,
  onRetry,
  onFavoritesPress,
  onLearnedPress,
  pageNumber,
  totalPages,
  totalCount,
  onPrevPage,
  onNextPage,
  onPageChange,
}) {
  const [viewMode, setViewMode] = React.useState('card') // 'card' or 'table'

  const levels = [
    { id: null, label: 'Tất cả' },
    { id: 1, label: 'TOPIK 1' },
    { id: 2, label: 'TOPIK 2' },
    { id: 3, label: 'TOPIK 3' },
    { id: 4, label: 'TOPIK 4' },
    { id: 5, label: 'TOPIK 5' },
    { id: 6, label: 'TOPIK 6' },
  ]

  if (isInitialLoading && loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải danh sách chủ đề..."
        style={styles.loadingContainer}
      />
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []

    let startPage = Math.max(1, pageNumber - 2)
    let endPage = Math.min(totalPages, startPage + 4)
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <View style={styles.paginationSection}>
        <View style={styles.paginationWrapper}>
          <Pressable
            onPress={onPrevPage}
            disabled={pageNumber <= 1 || loading}
            style={({ pressed }) => [
              styles.pageStepButton,
              pageNumber <= 1 && styles.pageButtonDisabled,
              pressed && styles.pageButtonPressed,
            ]}
          >
            <StudyIcon source={ArrowIcon} width={16} height={16} style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>

          <View style={styles.pageNumbers}>
            {startPage > 1 && (
              <>
                <PageButton page={1} active={pageNumber === 1} onPress={onPageChange} />
                {startPage > 2 && <Text style={styles.pageDots}>...</Text>}
              </>
            )}

            {pages.map(p => (
              <PageButton key={p} page={p} active={pageNumber === p} onPress={onPageChange} />
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && <Text style={styles.pageDots}>...</Text>}
                <PageButton page={totalPages} active={pageNumber === totalPages} onPress={onPageChange} />
              </>
            )}
          </View>

          <Pressable
            onPress={onNextPage}
            disabled={pageNumber >= totalPages || loading}
            style={({ pressed }) => [
              styles.pageStepButton,
              pageNumber >= totalPages && styles.pageButtonDisabled,
              pressed && styles.pageButtonPressed,
            ]}
          >
            <StudyIcon source={ArrowIcon} width={16} height={16} />
          </Pressable>
        </View>
        <Text style={styles.pageInfoText}>Hiển thị {topics.length} / {totalCount} chủ đề</Text>
      </View>
    )
  }

  const renderGridView = () => (
    <View
      style={[
        styles.gridContainer,
        loading && !isInitialLoading && styles.gridLoading
      ]}
    >
      {topics.map((topic) => (
        <View key={topic.id} style={styles.gridItem}>
          <FlashcardTopicCard
            icon={topic.icon}
            title={topic.title}
            subtitle={topic.subtitle}
            progress={topic.progress ?? 0}
            vocabularyCount={topic.vocabularyCount}
            onPress={() => onTopicPress?.(topic)}
          />
        </View>
      ))}
    </View>
  )

  const renderTableView = () => (
    <View style={styles.listBodyContent}>
      {topics.map((topic) => (
        <Pressable
          key={topic.id}
          onPress={() => onTopicPress?.(topic)}
          style={({ hovered, pressed }) => [
            styles.listItem,
            hovered && styles.listItemHover,
            pressed && styles.listItemActive,
          ]}
        >
          <View style={[styles.tableCell, { flex: 2, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
            <View style={styles.tableIconContainer}>
              <StudyIcon source={topic.icon} width={32} height={32} />
            </View>
            <Text style={styles.tableCellTitle} numberOfLines={1}>{topic.title}</Text>
          </View>

          <View style={[styles.tableCell, { flex: 3, paddingHorizontal: 12 }]}>
            <Text style={styles.tableCellSubtitle} numberOfLines={1}>{topic.subtitle}</Text>
          </View>

          <View style={[styles.tableCell, { width: 100, alignItems: 'center' }]}>
            <View style={styles.tableVocabBadge}>
              <Text style={styles.tableVocabText}>{topic.vocabularyCount || 0}</Text>
            </View>
          </View>

          <View style={[styles.tableCell, { width: 150, alignItems: 'center' }]}>
            <View style={styles.tableProgressBarBg}>
              <View
                style={[
                  styles.tableProgressBarFill,
                  { width: `${topic.progress ?? 0}%` },
                  topic.progress >= 100 && styles.tableProgressBarComplete
                ]}
              />
            </View>
            <Text style={styles.tableProgressText}>{Math.round(topic.progress ?? 0)}%</Text>
          </View>

          <View style={[styles.tableCell, { width: 120, alignItems: 'center' }]}>
            <TouchableOpacity
              style={styles.tableActionBtn}
              onPress={() => onTopicPress?.(topic)}
            >
              <Text style={styles.tableActionBtnText}>Học ngay</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      ))}
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.filtersSection}>
        <View style={styles.levelSelector}>
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
        </View>

        <View style={styles.rightActions}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={styles.viewModeToggle}>
              <TouchableOpacity
                onPress={() => setViewMode('card')}
                style={[styles.toggleBtn, viewMode === 'card' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, viewMode === 'card' && styles.toggleBtnTextActive]}>Thẻ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewMode('table')}
                style={[styles.toggleBtn, viewMode === 'table' && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, viewMode === 'table' && styles.toggleBtnTextActive]}>Bảng</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputWrapper}>
                <StudyIcon source={SearchIcon} width={18} height={18} tintColor="#999" />
                <TextInput
                  value={searchTerm}
                  placeholder="Tìm kiếm..."
                  onChangeText={onSearchChange}
                  onSubmitEditing={onSearchSubmit}
                  style={styles.searchInput}
                  placeholderTextColor="#999"
                  editable={!loading}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.contentScroll}
        contentContainerStyle={styles.contentScrollInner}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.contentWrap}>
          {error && topics.length === 0 ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
                <Text style={styles.retryButtonText}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : topics.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <StudyIcon source={SearchIcon} width={40} height={40} tintColor="#CCC" />
              </View>
              <Text style={styles.emptyTitle}>Không tìm thấy chủ đề nào</Text>
              <Text style={styles.emptySubtitle}>Thử đổi từ khóa hoặc mức độ TOPIK khác xem sao nhé!</Text>
              <TouchableOpacity style={styles.clearSearchBtn} onPress={() => onSearchChange('')}>
                <Text style={styles.clearSearchBtnText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
            </View>
          ) : (
            viewMode === 'card' ? renderGridView() : renderTableView()
          )}
        </View>
      </ScrollView>

      {totalPages > 1 && (
        <View style={styles.paginationSticky}>
          {renderPagination()}
        </View>
      )}
    </View>
  )
}

function PageButton({ page, active, onPress }) {
  return (
    <Pressable
      onPress={() => onPress?.(page)}
      style={({ pressed }) => [
        styles.pageButton,
        active && styles.pageButtonActive,
        pressed && styles.pageButtonPressed,
      ]}
    >
      <Text style={[styles.pageButtonText, active && styles.pageButtonTextActive]}>{page}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollInner: {
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 100,
    flex: 1,
  },
  filtersSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  levelSelector: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  levelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
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
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  viewModeToggle: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }),
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  toggleBtnTextActive: {
    color: '#0F172A',
  },
  searchContainer: {
    maxWidth: 240,
    flex: 1,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    }),
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1A1A1A',
    ...(Platform.OS === 'web' && { outlineStyle: 'none' }),
  },
  contentWrap: {
    minHeight: 400,
  },
  gridContainer: {
    ...(Platform.OS === 'web' && {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    }),
  },
  gridLoading: {
    opacity: 0.5,
  },
  gridItem: {
  },
  // Table Styles
  tableWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 30px rgba(0,0,0,0.03)',
    }),
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'Epilogue, sans-serif',
  },
  tableBody: {
    width: '100%',
  },
  tableBodyScroll: {
    maxHeight: 750, // Chiều cao xấp xỉ 10 dòng
  },
  tableBodyContent: {
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { transition: 'all 0.2s ease', cursor: 'pointer' }),
  },
  tableRowAlt: {
    backgroundColor: '#FCFCFC',
  },
  tableRowHover: {
    backgroundColor: '#FEF7E640',
  },
  tableRowActive: {
    backgroundColor: '#FEF7E680',
  },
  // List View Styles (Horizontal Cards)
  listBodyScroll: {
    maxHeight: 750,
  },
  listBodyContent: {
    width: '100%',
    paddingRight: 4,
  },
  listItem: {
    flexDirection: 'row',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5F5F5',
    marginBottom: 16,
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      cursor: 'pointer'
    }),
  },
  listItemHover: {
    borderColor: '#F1BE4B40',
    backgroundColor: '#FAFAFA',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
      transform: 'translateX(6px)'
    }),
  },
  listItemActive: {
    backgroundColor: '#FEF7E6',
    transform: [{ scale: 0.99 }],
  },
  tableCell: {
    //
  },
  tableIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FEF7E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableCellTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  tableCellSubtitle: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    fontFamily: 'Epilogue, sans-serif',
  },
  tableVocabBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#F1BE4B15',
    borderRadius: 10,
  },
  tableVocabText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#D9A635',
  },
  tableProgressBarBg: {
    width: 120,
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  tableProgressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
  },
  tableProgressBarComplete: {
    backgroundColor: '#4CAF50',
  },
  tableProgressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#999',
  },
  tableActionBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  tableActionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  paginationSticky: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    marginTop: 'auto',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 -10px 25px rgba(0,0,0,0.03)',
      zIndex: 10,
    }),
  },
  paginationSection: {
    alignItems: 'center',
    gap: 8,
  },
  paginationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  pageButtonActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  pageButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    fontFamily: 'Epilogue, sans-serif',
  },
  pageButtonTextActive: {
    color: '#1A1A1A',
  },
  pageStepButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  pageButtonDisabled: {
    opacity: 0.3,
    ...(Platform.OS === 'web' && { cursor: 'not-allowed' }),
  },
  pageDots: {
    color: '#999',
    fontSize: 16,
    fontWeight: '800',
  },
  pageInfoText: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    height: 44,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
    fontWeight: '800',
    color: '#1A1A1A',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 80,
    backgroundColor: '#FAFAFA',
    borderRadius: 32,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: 24,
  },
  clearSearchBtn: {
    paddingHorizontal: 20,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    borderRadius: 10,
    justifyContent: 'center',
  },
  clearSearchBtnText: {
    fontWeight: '700',
    color: '#64748B',
  },
})

