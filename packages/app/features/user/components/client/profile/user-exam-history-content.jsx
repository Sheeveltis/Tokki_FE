import React from 'react'
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Image, Platform, Pressable } from 'react-native'
import Carrot from '../../../../../../assets/carrot.png'
import { useRouter } from 'solito/navigation'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Format date từ ISO string sang định dạng Việt Nam
 */
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch (error) {
    return 'N/A'
  }
}

const getStatusInfo = (status) => {
  switch (status) {
    case 'Completed':
      return { label: 'Hoàn thành', color: '#4CAF50', bgColor: '#E8F5E9' }
    case 'InProgress':
      return { label: 'Đang làm', color: '#FF9800', bgColor: '#FFF3E0' }
    case 'Abandoned':
      return { label: 'Thoát giữa chừng', color: '#F44336', bgColor: '#FFEBEE' }
    default:
      return { label: status || 'Không rõ', color: '#757575', bgColor: '#F5F5F5' }
  }
}

export function UserExamHistoryContent({ exams, loading, error }) {
  const isWeb = Platform.OS === 'web'
  const router = useRouter()

  const handleItemPress = (userExamId) => {
    router.push(`/roadmap/test/result?userExamId=${userExamId}`)
  }

  return (
    <View style={styles.container}>
      {isWeb && (
        <Image source={normalizeImageSource(Carrot)} style={styles.carrot} resizeMode="contain" />
      )}

      <View style={isWeb ? styles.header : styles.headerNative}>
        <Text style={styles.title}>Lịch sử làm bài</Text>
        <Text style={styles.subtitle}>Xem lại kết quả các bài thi bạn đã thực hiện</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F1BE4B" />
          <Text style={styles.loadingText}>Đang tải lịch sử bài thi...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : !exams || exams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có lịch sử làm bài nào</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.listContainer} showsVerticalScrollIndicator={false}>
          {exams.map((exam) => {
            const statusInfo = getStatusInfo(exam.status)
            return (
              <Pressable
                key={exam.userExamId}
                style={({ pressed, hovered }) => [
                  styles.itemCard,
                  hovered && styles.itemCardHovered,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.99 }] }
                ]}
                onPress={() => handleItemPress(exam.userExamId)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.examTitle} numberOfLines={1}>{exam.examTitle}</Text>
                  <Text style={styles.attemptTime}>Lần cuối: {formatDate(exam.lastAttempt)}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
                  <Text style={[styles.statusText, { color: statusInfo.color }]}>
                    {statusInfo.label}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <StudyIcon source={ArrowIcon} width={16} height={16} tintColor="#CCC" />
                </View>
              </Pressable>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    position: 'relative',
  },
  carrot: {
    position: 'absolute',
    top: -40,
    right: 100,
    width: 120,
    height: 80,
    transform: [{ rotate: '15deg' }],
  },
  header: {
    gap: 4,
  },
  headerNative: {
    gap: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
    color: '#20130A',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  scrollView: {
    flex: 1,
  },
  listContainer: {
    gap: 12,
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBFBFA',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
    transitionDuration: '200ms',
  },
  itemCardHovered: {
    backgroundColor: '#FFF9F0',
    borderColor: '#F1BE4B',
    transform: [{ translateX: 4 }],
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(241, 190, 75, 0.12)',
      }
    })
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  attemptTime: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  arrowContainer: {
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  errorText: {
    fontSize: 14,
    color: '#F44336',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontStyle: 'italic',
  },
})
