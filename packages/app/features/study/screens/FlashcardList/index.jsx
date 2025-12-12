'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { FlashcardTopicCard } from '../../components/flashcard'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { Navbar } from 'components/navbar'
import { getFlashcardTopics } from '../../api'
import { studyStyles } from '../../styles'
import { LoadingWithContainer } from '../../../../../components/Loading'

export function FlashcardListScreen({ onTopicPress, onBackPress, title = 'Flashcard', levelId }) {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch flashcard topics từ API
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getFlashcardTopics(levelId)
      setTopics(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error fetching flashcard topics:', err)
      setError(err.message || 'Không thể tải danh sách chủ đề flashcard')
      setTopics([])
    } finally {
      setLoading(false)
    }
  }, [levelId])

  // Load data khi component mount hoặc levelId thay đổi
  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  // Render loading state
  if (loading) {
    return (
      <View style={styles.root}>
        <Navbar />
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
      </View>
    )
  }

  // Render error state
  if (error && topics.length === 0) {
    return (
      <View style={styles.root}>
        <Navbar />
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.backBtn}>
              <NavigationPill
                label="Quay lại"
                to={undefined}
                icon={ArrowIcon}
                iconStyle={{ transform: [{ scaleX: -1 }] }}
                onPress={onBackPress}
                textStyle={{ fontWeight: '700' }}
              />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTopics}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <Navbar />

      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.backBtn}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
            />
          </View>
          <Text style={styles.title}>{title}</Text>
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
                badgeText="펀"
                onPress={() => onTopicPress?.(topic.id)}
              />
            ))
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    alignItems: 'center',
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 16,
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
  listContainer: {
    width: '90%',
    maxWidth: 1200,
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

export default FlashcardListScreen

