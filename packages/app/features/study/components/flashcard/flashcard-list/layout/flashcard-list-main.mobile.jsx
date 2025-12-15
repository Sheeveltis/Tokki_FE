import React from 'react'
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import { FlashcardTopicCard } from '../../index'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../../assets/icon/icon-mainflow/arrow.svg'
import { studyStyles } from '../../../../styles'
import { LoadingWithContainer } from '../../../../../../../components/Loading'

/**
 * FlashcardListMain (Mobile): Nội dung chính của trang danh sách flashcard trên mobile
 */
export function FlashcardListMain({
  title,
  topics,
  loading,
  error,
  onBackPress,
  onTopicPress,
  onRetry,
}) {
  // Render loading state
  if (loading) {
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
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <>
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
    </>
  )
}

const styles = StyleSheet.create({
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
    width: '100%',
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

