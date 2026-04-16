import React, { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react'
import { StyleSheet, Text, View, Image, Pressable, Platform } from 'react-native'
import { normalizeImageSource, getMinigameTopics } from '../../../api/matching-card-topic-api'

const MatchingCardTopicComponent = forwardRef(({ levelId, selectedId, onSelect, onConfirm }, ref) => {
  const [apiTopics, setApiTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(selectedId || null)
  const [pageNumber, setPageNumber] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const handleConfirm = () => {
    console.log('[MatchingCardTopic] handleConfirm called, current:', current)
    if (!current) {
      console.warn('[MatchingCardTopic] No topic selected')
      return
    }
    const dataSource = Array.isArray(apiTopics) ? apiTopics : []
    const topic = dataSource.find((t) => t.id === current)
    console.log('[MatchingCardTopic] Found topic:', topic)
    if (typeof onConfirm === 'function') {
      onConfirm(topic || { id: current })
    } else {
      console.warn('[MatchingCardTopic] onConfirm callback not provided')
    }
  }
  
  // Expose handleConfirm to parent via ref
  useImperativeHandle(ref, () => ({
    confirm: handleConfirm
  }))

  const fetchTopics = useCallback(async () => {
    if (!levelId) {
      setApiTopics([])
      setTotalPages(1)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await getMinigameTopics(levelId, { pageNumber, pageSize: 3 })
      const items = Array.isArray(res?.items) ? res.items : []
      setApiTopics(items)
      setTotalPages(typeof res?.totalPages === 'number' ? res.totalPages : 1)
    } catch (error) {
      console.error('MatchingCardTopic/fetch error:', error)
      setApiTopics([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [levelId, pageNumber])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const dataSource = Array.isArray(apiTopics) ? apiTopics : []

  useEffect(() => {
    if (selectedId) {
      setCurrent(selectedId)
    } else if (dataSource?.[0]?.id) {
      setCurrent(dataSource[0].id)
    }
  }, [selectedId, dataSource])

  const handleSelect = (id) => {
    setCurrent(id)
    if (typeof onSelect === 'function') onSelect(id)
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Chủ đề</Text>

      <View style={styles.list}>
        {dataSource.map((topic) => {
          const active = topic.id === current
          return (
            <Pressable
              key={topic.id}
              onPress={() => handleSelect(topic.id)}
              style={[styles.item, active && styles.itemActive]}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                  <Image
                    source={normalizeImageSource(topic.imgUrl)}
                    style={styles.avatar}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.itemText}>
                <Text style={styles.itemTitle} numberOfLines={1}>{topic.titleKo}</Text>
                <Text style={styles.itemSubtitle} numberOfLines={2}>{topic.titleVi}</Text>
              </View>
            </Pressable>
          )
        })}
      </View>

      <View style={styles.pagination}>
        <Pressable
          onPress={() => setPageNumber((p) => Math.max(1, p - 1))}
          disabled={loading || pageNumber <= 1}
          style={[styles.pageBtn, (loading || pageNumber <= 1) && styles.pageBtnDisabled]}
        >
          <Text style={styles.pageBtnText}>Trước</Text>
        </Pressable>

        <Text style={styles.pageInfo}>{pageNumber}/{totalPages}</Text>

        <Pressable
          onPress={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
          disabled={loading || pageNumber >= totalPages}
          style={[styles.pageBtn, (loading || pageNumber >= totalPages) && styles.pageBtnDisabled]}
        >
          <Text style={styles.pageBtnText}>Sau</Text>
        </Pressable>
      </View>
    </View>
  )
})

export const MatchingCardTopic = MatchingCardTopicComponent

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'Epilogue, sans-serif',
  },
  list: {
    gap: 16,
    paddingVertical: 4,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },
  pageBtn: {
    backgroundColor: '#F1BE4B',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  pageBtnDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && { cursor: 'not-allowed' }),
  },
  pageBtnText: {
    color: '#1A1A1A',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    minWidth: 56,
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),
  },
  itemActive: {
    backgroundColor: '#FEF7E6',
    borderColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(241, 190, 75, 0.15)',
    }),
  },
  itemLeft: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 50,
    height: 50,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
})


