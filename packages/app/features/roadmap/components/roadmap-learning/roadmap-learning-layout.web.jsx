import { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable, Modal, ActivityIndicator, Platform, ScrollView } from 'react-native'
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
          <ActivityIndicator size="large" color="#FFCF6C" />
          <Text style={styles.loadingText}>Đang chuẩn bị lộ trình của bạn...</Text>
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
          <RoadmapTestButton title="Thử lại ngay" onPress={onRetry} style={styles.retryButton} />
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
              <View style={styles.badgeRow}>
                <View style={styles.phaseBadge}>
                  <Text style={styles.phaseBadgeText}>{phaseLabel}</Text>
                </View>
                <View style={[styles.levelBadge, { backgroundColor: '#FF6B6B' }]}>
                  <Text style={styles.levelBadgeText}>Level {targetAim}</Text>
                </View>
              </View>
              <View style={styles.titleRow}>
                <Text style={styles.title}>Lộ trình học tập cá nhân</Text>
                <Pressable
                  onPress={() => setIsInfoModalVisible(true)}
                  style={({ pressed }) => [styles.infoIconWrapper, pressed && styles.infoIconPressed]}
                >
                  <Text style={styles.infoIconText}>i</Text>
                </Pressable>
              </View>
              <Text style={styles.subtitle}>Cùng Tokki chinh phục mục tiêu của bạn mỗi ngày</Text>
            </View>

            <View style={styles.headerActions}>
              <Pressable
                onPress={() => setIsHistoryModalVisible(true)}
                style={({ pressed }) => [styles.historyIconButton, pressed && styles.historyIconButtonPressed]}
              >
                <HistoryIcon width={22} height={22} />
              </Pressable>
            </View>
          </View>

          <View style={styles.cardDivider} />

          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Tiến độ lộ trình</Text>
                <Text style={styles.progressValue}>{roadmapData?.progressPercent || 0}%</Text>
              </View>
              <Text style={styles.progressStatusText}>
                {roadmapData?.progressPercent === 100 ? 'Hoàn thành xuất sắc!' : 'Hãy tiếp tục cố gắng nhé!'}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${roadmapData?.progressPercent || 0}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.listWrapper}>
          <RoadmapLearningDayList
            hasWriting={hasWriting}
            targetAim={targetAim}
            weeks={roadmapData.weeks || []}
            activeWeek={activeWeek}
          />
        </View>
      </View>

      <RoadmapExamHistoryModal visible={isHistoryModalVisible} onClose={() => setIsHistoryModalVisible(false)} />

      <Modal visible={isInfoModalVisible} transparent animationType="fade" onRequestClose={() => setIsInfoModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsInfoModalVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Thông tin lộ trình</Text>
                <Text style={styles.modalSubtitle}>Đánh giá và mục tiêu học tập</Text>
              </View>
              <Pressable onPress={() => setIsInfoModalVisible(false)} style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}>
                <Text style={styles.closeButtonText}>×</Text>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {!!roadmapData?.assessment && (
                <View style={styles.assessmentSection}>
                  <Text style={styles.sectionTitle}>Chuyên gia Tokki đánh giá</Text>
                  <View style={styles.assessmentBox}>
                    <Text style={styles.assessmentText}>{roadmapData.assessment}</Text>
                  </View>
                </View>
              )}

              {!!activeWeek && (
                <View style={styles.weekSection}>
                  <Text style={styles.sectionTitle}>Tiêu điểm tuần này</Text>
                  <View style={styles.weekInfoBox}>
                    <View style={styles.weekInfoHeader}>
                      <Text style={styles.weekInfoTitle}>Tuần {activeWeek.weekIndex}</Text>
                      <View style={styles.statusIndicator}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>Đang diễn ra</Text>
                      </View>
                    </View>
                    {!!activeWeek.focusGoal && <Text style={styles.weekInfoGoal}>{activeWeek.focusGoal}</Text>}
                  </View>
                </View>
              )}
            </ScrollView>
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
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1200,
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    // marginTop: 64, // Space for navbar
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  header: {
    gap: 20,
    flexShrink: 0
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },
  headerText: {
    flex: 1,
    gap: 6
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  phaseBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C28A04',
    textTransform: 'uppercase',
  },
  levelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  infoIconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoIconPressed: {
    backgroundColor: '#EAEAEA',
  },
  infoIconText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  historyIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }),
  },
  historyIconButtonPressed: {
    backgroundColor: '#333',
    transform: [{ scale: 0.95 }]
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  progressSection: {
    gap: 10,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6B6B',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressStatusText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
    ...(Platform.OS === 'web' && {
      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }),
  },
  listWrapper: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 2,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    maxWidth: '80%',
  },
  retryButton: {
    minWidth: 160
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(4px)' }),
  },
  modalContent: {
    width: '90%',
    maxWidth: 540,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    ...(Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    backgroundColor: '#EEEEEE',
    transform: [{ scale: 0.95 }],
  },
  closeButtonText: {
    fontSize: 24,
    color: '#1A1A1A',
    fontWeight: '300',
    lineHeight: 28,
  },
  modalBody: {
    maxHeight: 500,
  },
  assessmentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C28A04',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  assessmentBox: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFF2CC',
  },
  assessmentText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
  },
  weekSection: {
    marginBottom: 8,
  },
  weekInfoBox: {
    backgroundColor: '#F8F9FA',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  weekInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekInfoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif'
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2E7D32',
    fontFamily: 'Epilogue, sans-serif'
  },
  weekInfoGoal: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif'
  },
})
