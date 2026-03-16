import { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'
import { RoadmapExamHistoryModal } from './roadmap-exam-history-modal.web'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'

const getTopikPhaseByLevel = (level) => {
  if (level === 1 || level === 2) return 'TOPIK I'
  if (level >= 3 && level <= 6) return 'TOPIK II'
  return 'TOPIK I'
}

export function RoadmapLearningLayout({
  roadmapData,
  isLoading = false,
  error = null,
  onRetry,
}) {
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)

  const targetAim = roadmapData?.targetAim || 1
  const hasWriting = useMemo(() => targetAim >= 3, [targetAim])
  const phaseLabel = useMemo(() => getTopikPhaseByLevel(targetAim), [targetAim])

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={[styles.contentWrapper, styles.centerContent]}>
          <Text style={styles.loadingText}>Đang tải lộ trình...</Text>
        </View>
      </View>
    )
  }

  if (error || !roadmapData) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={[styles.contentWrapper, styles.centerContent]}>
          <Text style={styles.errorText}>
            {error || 'Không thể tải lộ trình hiện tại.'}
          </Text>
          <RoadmapTestButton
            title="Tải lại"
            onPress={onRetry}
            style={styles.retryButton}
          />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Lộ trình {phaseLabel} - Level {targetAim}</Text>
              <Text style={styles.subtitle}>Phần nghe / đọc / viết theo ngày</Text>
            </View>
            <Pressable
              onPress={() => setIsHistoryModalVisible(true)}
              style={({ pressed }) => [
                styles.historyButton,
                pressed && styles.historyButtonPressed,
              ]}
            >
              <Text style={styles.historyButtonText}>Lịch sử làm bài</Text>
            </Pressable>
          </View>
          {!!roadmapData.assessment && (
            <View style={styles.assessmentBox}>
              <Text style={styles.assessmentTitle}>Đánh giá đầu vào</Text>
              <Text style={styles.assessmentText}>{roadmapData.assessment}</Text>
            </View>
          )}
        </View>

        <View style={styles.listWrapper}>
          <RoadmapLearningDayList
            hasWriting={hasWriting}
            targetAim={targetAim}
            weeks={roadmapData.weeks || []}
          />
        </View>
      </View>

      <RoadmapExamHistoryModal
        visible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: '100%',
    minHeight: '90vh',
    alignItems: 'stretch',
    backgroundColor: '#FDF7EC',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  historyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  historyButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.95 }],
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  listWrapper: {
    flex: 1,
    marginTop: 8,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 140,
  },
  assessmentBox: {
    marginTop: 16,
    backgroundColor: '#FFF1DA',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  assessmentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 6,
  },
  assessmentText: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
})

