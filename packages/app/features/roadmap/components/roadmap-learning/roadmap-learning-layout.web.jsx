import { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'
import { RoadmapExamHistoryModal } from './roadmap-exam-history-modal.web'
import HistoryIcon from '../../../../../assets/icon/icon-roadmap/history.svg'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'

const getTopikPhaseByLevel = (level) => {
  if (level === 1 || level === 2) return 'TOPIK I'
  if (level >= 3 && level <= 6) return 'TOPIK II'
  return 'TOPIK I'
}

export function RoadmapLearningLayout({ roadmapData, isLoading = false, error = null, onRetry }) {
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false)

  const activeWeek = useMemo(() => {
    const weeks = roadmapData?.weeks || []
    if (!Array.isArray(weeks) || !weeks.length) return null
    const inProgressWeek = weeks.find((week) => week?.status === 'InProgress')
    if (inProgressWeek) return inProgressWeek
    const weekWithTasks = weeks.find((week) => Array.isArray(week?.tasks) && week.tasks.length)
    if (weekWithTasks) return weekWithTasks
    return weeks[0]
  }, [roadmapData?.weeks])

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
          <Text style={styles.errorText}>{error || 'Không thể tải lộ trình hiện tại.'}</Text>
          <RoadmapTestButton title="Tải lại" onPress={onRetry} style={styles.retryButton} />
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
              <View style={styles.titleRow}>
                <Text style={styles.title}>Lộ trình {phaseLabel} - Level {targetAim}</Text>
                <Pressable onPress={() => setIsInfoModalVisible(true)} style={styles.infoIconWrapper}>
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <Text style={styles.subtitle}>Chọn ngày học để xem nội dung cần hoàn thành</Text>
            </View>
            <Pressable
              onPress={() => setIsHistoryModalVisible(true)}
              style={({ pressed }) => [styles.historyIconButton, pressed && styles.historyIconButtonPressed]}
              accessibilityLabel="Lịch sử làm bài"
            >
              <HistoryIcon width={22} height={22} />
            </Pressable>
          </View>


        </View>

        <View style={styles.listWrapper}>
          <RoadmapLearningDayList hasWriting={hasWriting} targetAim={targetAim} weeks={roadmapData.weeks || []} activeWeek={activeWeek} />
        </View>
      </View>

      <RoadmapExamHistoryModal visible={isHistoryModalVisible} onClose={() => setIsHistoryModalVisible(false)} />

      <Modal visible={isInfoModalVisible} transparent animationType="fade" onRequestClose={() => setIsInfoModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsInfoModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thông tin lộ trình</Text>
              <Pressable onPress={() => setIsInfoModalVisible(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>
            
            <View style={styles.modalBody}>
              {!!roadmapData?.assessment && (
                <View style={styles.assessmentBox}>
                  <Text style={styles.assessmentTitle}>Đánh giá đầu vào</Text>
                  <Text style={styles.assessmentText}>{roadmapData.assessment}</Text>
                </View>
              )}

              {!!activeWeek && (
                <View style={styles.weekInfoBox}>
                  <Text style={styles.weekInfoTitle}>Tuần {activeWeek.weekIndex}</Text>
                  <Text style={styles.weekInfoStatus}>Trạng thái: {activeWeek.status === 'InProgress' ? 'Đang học' : activeWeek.status}</Text>
                  {!!activeWeek.focusGoal && <Text style={styles.weekInfoGoal}>{activeWeek.focusGoal}</Text>}
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1160,
    flex: 1,
    minHeight: 0,
    alignItems: 'stretch',
    backgroundColor: '#FDF7EC',
    paddingTop: 72,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  header: { gap: 8, flexShrink: 0 },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerText: { flex: 1, gap: 2 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 1, // Optional tweak for vertical alignment
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  historyIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  historyIconButtonPressed: { backgroundColor: '#FF5252', transform: [{ scale: 0.95 }] },
  listWrapper: {
    flex: 1,
    minHeight: 0,
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
  retryButton: { minWidth: 140 },
  assessmentBox: {
    backgroundColor: '#FFF1DA',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  assessmentTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  assessmentText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: '#FDF7EC',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.95 }],
  },
  closeButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 24,
  },
  modalBody: {
    gap: 16,
  },
  weekInfoBox: {
    backgroundColor: '#FFF1DA', borderRadius: 14, borderWidth: 1, borderColor: '#FFE0B3', padding: 12, gap: 2,
  },
  weekInfoTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1C', fontFamily: 'Epilogue, sans-serif' },
  weekInfoStatus: { fontSize: 13, fontWeight: '600', color: '#6B4B1F', fontFamily: 'Epilogue, sans-serif' },
  weekInfoGoal: { fontSize: 13, lineHeight: 18, color: '#4A4A4A', fontFamily: 'Epilogue, sans-serif' },
})
