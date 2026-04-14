'use client'

import React, { useCallback, useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native'
import { useRouter } from 'solito/navigation'
import { searchVocabulariesForUser } from '../../api'
import RabbitWaitingImage from 'assets/bunny/2.png'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'

/**
 * Ant Design Style Search Icon
 */
const AntdSearchIcon = ({ size = 18, color = '#FFF' }) => (
  <View style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.32 14.9l5.39 5.4a1 1 0 01-1.42 1.4l-5.38-5.38a8 8 0 111.41-1.42zM10 16a6 6 0 100-12 6 6 0 000 12z"
        fill={color}
      />
    </svg>
  </View>
)

/**
 * VocabCard: Component hiển thị từng từ vựng trong danh sách kết quả tìm kiếm
 */
const VocabCard = ({ item, onPress }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.vocabCard,
        isHovered && styles.vocabCardHover
      ]}
    >
      <View style={styles.vocabInfo}>
        <View style={styles.vocabHeaderLine}>
          <Text style={styles.vocabWord}>{item.text || 'Không có từ'}</Text>
          {!!item.pronunciation && (
            <Text style={styles.vocabPronunciation}>/{item.pronunciation}/</Text>
          )}
        </View>

        {!!item.definition && (
          <Text style={styles.vocabMeaning} numberOfLines={2}>{item.definition}</Text>
        )}

        <View style={styles.vocabFooter}>
          {!!item.vocabularyId && (
            <Text style={styles.vocabId}>ID: {item.vocabularyId}</Text>
          )}
          <View style={styles.detailLink}>
            <Text style={styles.detailLinkText}>Xem chi tiết →</Text>
          </View>
        </View>
      </View>
    </Pressable>
  )
}

/**
 * Màn Dictionary dành cho user:
 * - Cho phép tìm kiếm từ vựng theo ID hoặc theo text tiếng Hàn
 * - Hiển thị nhanh nghĩa, phiên âm và ví dụ (nếu có)
 */
export function DictionarySearchScreen() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [isFavBtnHovered, setIsFavBtnHovered] = useState(false)

  // Pagination State
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNextPage, setHasNextPage] = useState(false)

  const handleSearch = useCallback(async (pageToLoad = 1) => {
    const trimmed = query.trim()
    setHasSearched(true)
    setError('')

    if (!trimmed) {
      setResults([])
      setPage(1)
      setTotalPages(1)
      setTotalCount(0)
      setHasNextPage(false)
      return
    }

    try {
      if (pageToLoad === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }

      const res = await searchVocabulariesForUser({
        pageNumber: pageToLoad,
        pageSize: 10, // Ưu tiên số chẵn để grid đẹp (4x4)
        searchTerm: trimmed,
      })

      const items = Array.isArray(res?.items) ? res.items : []

      setResults(items)
      setPage(res.pageNumber || pageToLoad)
      setTotalPages(res.totalPages || 1)
      setTotalCount(res.totalCount || 0)
      setHasNextPage(res.hasNextPage || false)

      if (pageToLoad === 1 && items.length === 0) {
        setError('Không tìm thấy từ vựng phù hợp.')
      }
    } catch (e) {
      console.error('Error searching vocabularies in dictionary screen:', e)
      if (pageToLoad === 1) {
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.')
        setResults([])
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [query])

  const handleLoadMore = () => {
    if (!loading && !loadingMore && hasNextPage) {
      handleSearch(page + 1)
    }
  }

  const handleSubmitEditing = () => {
    if (!loading) {
      handleSearch()
    }
  }

  // Tự động tìm kiếm khi người dùng nhập (debounce)
  useEffect(() => {
    const trimmed = query.trim()

    if (!trimmed) {
      setResults([])
      setError('')
      setHasSearched(false)
      return
    }

    const timer = setTimeout(() => {
      if (!loading) {
        handleSearch()
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [query, handleSearch])


  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.brandTitle}>Từ điển <Text style={styles.brandHighlight}>Tokki</Text></Text>
            <Text style={styles.brandSubtitle}>Tra cứu từ vựng tiếng Hàn nhanh chóng & chính xác</Text>
          </View>
          
          <View style={styles.headerRight}>
            <Pressable 
              style={[
                styles.favNavBtn,
                isFavBtnHovered && styles.favNavBtnHover
              ]}
              onMouseEnter={() => setIsFavBtnHovered(true)}
              onMouseLeave={() => setIsFavBtnHovered(false)}
              onPress={() => router.push('/flashcard/favorites')}
            >
              <StarIcon width={18} height={18} fill="#F1BE4B" />
              <Text style={styles.favNavBtnText}>Từ vựng yêu thích</Text>
            </Pressable>
            <Image source={RabbitWaitingImage} style={styles.headerRabbit} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.searchBoxWrapper}>
          <View style={[
            styles.searchInputContainer,
            isInputFocused && styles.searchInputContainerFocused
          ]}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={loading ? 'Đang tìm kiếm...' : 'Nhập từ tiếng Hàn hoặc nghĩa...'}
              placeholderTextColor="#999"
              onSubmitEditing={handleSubmitEditing}
              style={styles.searchInput}
            />
            <TouchableOpacity
              onPress={handleSearch}
              disabled={loading || !query.trim()}
              style={[
                styles.searchIconBtn,
                (loading || !query.trim()) && styles.searchIconBtnDisabled
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <AntdSearchIcon />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <View style={styles.resultsWrapperOuter}>
        {loading && results.length === 0 && (
          <View style={styles.statusContainer}>
            <ActivityIndicator color="#F1BE4B" size="large" />
            <Text style={styles.statusText}>Đang tra cứu cơ sở dữ liệu...</Text>
          </View>
        )}

        {!!error && !loading && (
          <View style={styles.statusContainer}>
            <Image source={RabbitWaitingImage} style={styles.statusImage} resizeMode="contain" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => handleSearch(1)}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !hasSearched && (
          <View style={styles.emptyPrompt}>
            <View style={styles.promptIconCircle}>
              <Image source={RabbitWaitingImage} style={styles.promptImage} resizeMode="contain" />
            </View>
            <Text style={styles.promptTitle}>Khám phá kho từ vựng Tokki</Text>
            <Text style={styles.promptSubtitle}>Nhập bất kỳ từ nào để xem định nghĩa, phát âm và các ví dụ thực tế nhé!</Text>
          </View>
        )}

        {hasSearched && results.length > 0 && (
          <View style={styles.resultsWrapper}>
            <View style={styles.resultsMeta}>
              <Text style={styles.resultsMetaText}>Tìm thấy {totalCount} kết quả phù hợp</Text>
            </View>
            <View style={styles.resultsGrid}>
              {results.map((item) => (
                <VocabCard
                  key={item.vocabularyId || item.id}
                  item={item}
                  onPress={() => {
                    const id = item.vocabularyId || item.id
                    if (id) router.push(`/dictionary/${id}`)
                  }}
                />
              ))}
            </View>

            {(totalPages > 1) && (
              <View style={styles.paginationWrapper}>
                <View style={styles.pageButtonsRow}>
                  <TouchableOpacity
                    style={[styles.pageNavBtn, page === 1 && styles.pageNavBtnDisabled]}
                    disabled={page === 1}
                    onPress={() => handleSearch(page - 1)}
                  >
                    <Text style={[styles.pageNavText, page === 1 && styles.pageNavTextDisabled]}>← Trước</Text>
                  </TouchableOpacity>

                  <View style={styles.pageNumbers}>
                    {[...Array(Math.min(5, totalPages))].map((_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (page <= 3) {
                        pageNum = i + 1
                      } else if (page > totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = page - 2 + i
                      }

                      return (
                        <TouchableOpacity
                          key={pageNum}
                          style={[styles.pageNumberBtn, page === pageNum && styles.pageNumberBtnActive]}
                          onPress={() => handleSearch(pageNum)}
                        >
                          <Text style={[styles.pageNumberText, page === pageNum && styles.pageNumberTextActive]}>
                            {pageNum}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                  </View>

                  <TouchableOpacity
                    style={[styles.pageNavBtn, page === totalPages && styles.pageNavBtnDisabled]}
                    disabled={page === totalPages}
                    onPress={() => handleSearch(page + 1)}
                  >
                    <Text style={[styles.pageNavText, page === totalPages && styles.pageNavTextDisabled]}>Sau →</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.totalPagesText}>Trang {page} / {totalPages}</Text>
              </View>
            )}
          </View>
        )}

        {!loading && hasSearched && results.length === 0 && !error && (
          <View style={styles.statusContainer}>
            <Image source={RabbitWaitingImage} style={styles.statusImage} resizeMode="contain" />
            <Text style={styles.statusTitle}>Rất tiếc, không tìm thấy kết quả</Text>
            <Text style={styles.statusSubtitle}>Bạn hãy thử kiểm tra lại chính tả hoặc tìm kiếm bằng từ khóa ngắn hơn nhé.</Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    minHeight: '100vh',
    width: Platform.OS === 'web' ? '70%' : '100%',
    alignSelf: 'center',
  },
  headerSection: {
    paddingTop: 60,
    paddingHorizontal: 50,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    width: '100%',
    maxWidth: 1200,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  brandHighlight: {
    color: '#F1BE4B',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 4,
  },
  headerRabbit: {
    width: 44,
    height: 44,
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  favNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    } : {}),
  },
  favNavBtnHover: {
    backgroundColor: '#FFF9EB',
    borderColor: '#F1BE4B50',
    ...(Platform.OS === 'web' ? {
      transform: [{ translateY: -2 }],
      boxShadow: '0 6px 16px rgba(241, 190, 75, 0.12)',
    } : {}),
  },
  favNavBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchBoxWrapper: {
    maxWidth: 800,
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingLeft: 20,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    transition: 'all 0.2s ease',
  },
  searchInputContainerFocused: {
    borderColor: '#F1BE4B',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(241, 190, 75, 0.08)',
    } : {
      shadowColor: '#F1BE4B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    }),
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '600',
    height: 44,
    outlineStyle: 'none',
  },
  searchIconBtn: {
    backgroundColor: '#F1BE4B',
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 8px rgba(241, 190, 75, 0.2)',
    } : {
      shadowColor: '#F1BE4B',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
    }),
  },
  searchIconBtnDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
  },
  searchIconText: {
    fontSize: 18,
  },
  resultsWrapperOuter: {
    flex: 1,
    paddingVertical: 40,
    paddingHorizontal: 50,
    backgroundColor: '#FFFFFF', // Đổi sang trắng để đồng bộ "1 screen"
    width: '100%',
  },
  resultsWrapper: {
    width: '100%',
    maxWidth: 1200,
  },
  paginationWrapper: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  pageButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumberBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  pageNumberBtnActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
  pageNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
  },
  pageNumberTextActive: {
    color: '#FFF',
  },
  pageNavBtn: {
    paddingHorizontal: 16,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    justifyContent: 'center',
  },
  pageNavBtnDisabled: {
    opacity: 0.5,
  },
  pageNavText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  pageNavTextDisabled: {
    color: '#999',
  },
  totalPagesText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  statusContainer: {
    paddingTop: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    marginTop: 16,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  statusImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.5,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 15,
    color: '#FF4D4F',
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
  },
  retryBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  emptyPrompt: {
    paddingTop: 60,
    alignItems: 'center',
  },
  promptIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  promptImage: {
    width: 80,
    height: 80,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  promptSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
    fontWeight: '500',
  },
  resultsWrapper: {
    width: '100%',
  },
  resultsMeta: {
    marginBottom: 20,
    paddingLeft: 4,
  },
  resultsMetaText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  vocabCard: {
    width: Platform.OS === 'web' ? 'calc(50% - 8px)' : '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  vocabCardHover: {
    borderColor: '#F1BE4B',
    transform: [{ scale: 1.02 }],
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 8px 16px rgba(241, 190, 75, 0.05)',
    } : {
      shadowColor: '#F1BE4B',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 16,
    }),
  },
  vocabInfo: {
    gap: 10,
  },
  vocabHeaderLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vocabWord: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  vocabPronunciation: {
    fontSize: 14,
    color: '#F1BE4B',
    fontWeight: '700',
  },
  vocabMeaning: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontWeight: '500',
  },
  vocabFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  vocabId: {
    fontSize: 11,
    color: '#DDD',
    fontWeight: '600',
  },
  detailLinkText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1BE4B',
  },
})

export default DictionarySearchScreen


