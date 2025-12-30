import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react'
import { StyleSheet, Text, View, Image, ScrollView, Pressable, Platform } from 'react-native'
import { normalizeImageSource, getMinigameTopics } from '../api/api'

const MatchingCardTopicComponent = forwardRef(({ levelId, selectedId, onSelect, onConfirm }, ref) => {
  const [apiTopics, setApiTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [current, setCurrent] = useState(selectedId || null)
  
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

  useEffect(() => {
    let isMounted = true

    const fetchTopics = async () => {
      if (!levelId) {
        if (isMounted) {
          setApiTopics([])
          setLoading(false)
        }
        return
      }

      try {
        setLoading(true)
        const list = await getMinigameTopics(levelId)
        if (!isMounted) return
        setApiTopics(Array.isArray(list) ? list : [])
      } catch (error) {
        console.error('MatchingCardTopic/fetch error:', error)
        if (isMounted) setApiTopics(null)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchTopics()

    return () => {
      isMounted = false
    }
  }, [levelId])

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

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
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
      </ScrollView>
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
    flexGrow: 0,
  },
  listContent: {
    gap: 12,
    paddingVertical: 4,
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


