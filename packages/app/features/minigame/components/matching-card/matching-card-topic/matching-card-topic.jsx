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
                <Image
                  source={normalizeImageSource(topic.imgUrl)}
                  style={styles.avatar}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.itemDivider} />

              <View style={styles.itemText}>
                <Text style={styles.itemTitle}>{topic.titleKo}</Text>
                <Text style={styles.itemSubtitle}>{topic.titleVi}</Text>
              </View>

              <View style={styles.itemBadge}>
                <Text style={styles.itemBadgeText}>펀</Text>
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
    backgroundColor: '#F5F0DD',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
    ...(Platform.OS === 'web' && { boxShadow: '0px 1px 5px rgba(0,0,0,0.15)' }),
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    gap: 12,
    paddingVertical: 4,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  pageBtn: {
    backgroundColor: '#7FA14D',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  pageBtnDisabled: {
    opacity: 0.5,
    ...(Platform.OS === 'web' && { cursor: 'not-allowed' }),
  },
  pageBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pageInfo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    minWidth: 56,
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FDEEB9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FDEEB9',
  },
  itemActive: {
    backgroundColor: '#F39F2D',
    borderColor: '#F39F2D',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  itemLeft: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
  },
  itemDivider: {
    width: 2,
    height: 60,
    backgroundColor: '#F1BE4B',
    marginHorizontal: 12,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#1C1C1C',
  },
  itemBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#C45A32',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE7D4',
  },
  itemBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C45A32',
  },
})


