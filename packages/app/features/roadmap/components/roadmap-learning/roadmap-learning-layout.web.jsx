import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { StyleSheet, Text, View, Pressable, Modal, ActivityIndicator, Platform, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'
import { RoadmapExamHistoryModal } from './roadmap-exam-history-modal.web'
import HistoryIcon from '../../../../../assets/icon/icon-roadmap/history.svg'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { Alert } from 'react-native'

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
  initialWeekIndex = null,
  initialDayIndex = null,
}) {
  const router = useRouter()
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false)
  const [isGeneratingNextWeek, setIsGeneratingNextWeek] = useState(false)
  const [progressData, setProgressData] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)

  // ĐỔI MỚI: Quản lý tuần hiện tại
  const [activeWeekIndex, setActiveWeekIndex] = useState(null)
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState(null)

  const weeks = useMemo(() => roadmapData?.weeks || [], [roadmapData])

  // Khởi tạo tuần đang học hoặc tuần từ URL (Đồng bộ sâu)
  useEffect(() => {
    if (weeks.length > 0 && activeWeekIndex === null) {
      if (initialWeekIndex !== null) {
        const found = weeks.find(w => w.weekIndex === initialWeekIndex)
        if (found) {
          setActiveWeekIndex(initialWeekIndex)
          return
        }
      }
      const inProgress = weeks.find(w => w.status === 'InProgress')
      if (inProgress) {
        setActiveWeekIndex(inProgress.weekIndex)
      } else {
        const completedWeeks = weeks.filter(w => w.status === 'Completed')
        if (completedWeeks.length > 0) {
          const lastFinishedIndex = Math.max(...completedWeeks.map(w => w.weekIndex))
          const nextWeek = weeks.find(w => w.weekIndex === lastFinishedIndex + 1)
          setActiveWeekIndex(nextWeek ? nextWeek.weekIndex : lastFinishedIndex)
        } else {
          setActiveWeekIndex(weeks[0].weekIndex)
        }
      }
    }
  }, [weeks, initialWeekIndex, activeWeekIndex])

  const activeWeek = useMemo(() => {
    return weeks.find(w => w.weekIndex === activeWeekIndex) || (weeks.length > 0 ? weeks[0] : null)
  }, [weeks, activeWeekIndex])

  const handleWeekChange = (index) => {
    setActiveWeekIndex(index)
    // Cập nhật URL để sync trạng thái, giữ cho trải nghiệm như một ứng dụng desktop
    router.replace(`/roadmap/learning?week=${index}`, undefined, { shallow: true })
  }

  const handleCancelRoadmap = async () => {
    console.log('Cancel roadmap clicked')
    const performCancel = async () => {
      setIsCancelling(true)
      try {
        await apiClient.post(ENDPOINTS.ROADMAP.CANCEL)
        if (Platform.OS === 'web') {
          window.alert('Đã hủy lộ trình thành công.')
        } else {
          Alert.alert('Thành công', 'Đã hủy lộ trình thành công.')
        }
        router.push('/roadmap/info')
      } catch (err) {
        console.error('Failed to cancel roadmap:', err)
        if (Platform.OS === 'web') {
          window.alert('Không thể hủy lộ trình. Vui lòng thử lại sau.')
        } else {
          Alert.alert('Lỗi', 'Không thể hủy lộ trình. Vui lòng thử lại sau.')
        }
      } finally {
        setIsCancelling(false)
      }
    }

    if (Platform.OS === 'web') {
      if (window.confirm('Bạn có chắc chắn muốn hủy lộ trình hiện tại? Tất cả các mục tiêu và tiến trình tuần này sẽ bị xóa.')) {
        await performCancel()
      }
    } else {
      Alert.alert(
        'Xác nhận hủy',
        'Bạn có chắc chắn muốn hủy lộ trình hiện tại? Tất cả các mục tiêu và tiến trình tuần này sẽ bị xóa.',
        [
          { text: 'Hủy bỏ', style: 'cancel' },
          {
            text: 'Xác nhận hủy',
            style: 'destructive',
            onPress: performCancel
          }
        ]
      )
    }
  }

  const pollIntervalRef = useRef(null)

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  const pollProgress = useCallback(
    async (jobId, shouldGoToNextWeek) => {
      stopPolling()
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await apiClient.get(ENDPOINTS.ROADMAP.PROGRESS(jobId))
          const data = response?.data
          setProgressData(data)

          if (data?.isCompleted) {
            stopPolling()
            setTimeout(() => {
              setIsGeneratingNextWeek(false)
              onRetry?.() // Refresh roadmap data
              if (shouldGoToNextWeek) {
                handleWeekChange(activeWeekIndex + 1)
              }
            }, 1500)
          } else if (data?.isError) {
            stopPolling()
            setIsGeneratingNextWeek(false)
            Alert.alert('Thông báo', data?.errorMessage || 'Có lỗi xảy ra trong quá trình tạo tuần mới.')
          }
        } catch (err) {
          console.error('Progress polling error:', err)
        }
      }, 2000)
    },
    [stopPolling, onRetry, activeWeekIndex, handleWeekChange]
  )

  const handleGenerateNextWeek = async () => {
    // 1. Xác định tuần mốc (tuần đã hoàn thành)
    // Nếu tuần hiện tại đã có bài học (đang ở Day 7 chẳng hạn), thì dùng tuần này làm mốc để tạo tuần TIẾP THEO.
    // Nếu tuần hiện tại đang trống (VD tuần 2 chưa có bài), thì dùng tuần TRƯỚC ĐÓ làm mốc để tạo nội dung cho chính tuần này.
    const currentWeekInfo = weeks.find(w => w.weekIndex === activeWeekIndex)
    const hasContent = Array.isArray(currentWeekInfo?.tasks) && currentWeekInfo.tasks.length > 0

    const referenceWeek = hasContent
      ? currentWeekInfo
      : weeks.find(w => w.weekIndex === (activeWeekIndex - 1))

    if (!referenceWeek?.roadmapWeekId) {
      Alert.alert('Thông báo', 'Không tìm thấy thông tin tuần học tham chiếu để khởi tạo lộ trình.')
      return
    }

    setIsGeneratingNextWeek(true)
    setProgressData({ percent: 10, step: 'Đang bắt đầu phân tích lộ trình...', isCompleted: false })

    try {
      // 2. Gọi API tạo tuần tiếp theo với finishedWeekId
      const response = await apiClient.post(ENDPOINTS.ROADMAP.NEXT_WEEK, {
        finishedWeekId: referenceWeek.roadmapWeekId
      })

      const jobId = response?.data?.data
      if (jobId) {
        setProgressData({ percent: 0, step: 'Đang bắt đầu...', isCompleted: false })
        pollProgress(jobId, hasContent)
      } else {
        setIsGeneratingNextWeek(false)
      }
    } catch (err) {
      console.error('Failed to generate next week:', err)
      const status = err.response?.status
      const backendMessage = err.response?.data?.message

      if (status === 403) {
        Alert.alert(
          'Yêu cầu nâng cấp VIP',
          'Tính năng tự động thiết kế lộ trình học tập nâng cao chỉ dành cho thành viên VIP. Bạn có muốn nâng cấp ngay không?',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Nâng cấp ngay', onPress: () => router.push('/payment-package'), style: 'default' }
          ]
        )
      } else {
        Alert.alert('Thông báo', backendMessage || 'Không thể tạo tuần tiếp theo. Vui lòng thử lại.')
      }
      setIsGeneratingNextWeek(false)
    }
  }

  const targetAim = roadmapData?.targetAim || 1
  const hasWriting = useMemo(() => targetAim >= 3, [targetAim])
  const phaseLabel = useMemo(() => getTopikPhaseByLevel(targetAim), [targetAim])

  // Logic xác định tuần tối đa có thể xem (Chỉ cho xem tuần tiếp theo khi đã hoàn thành tuần trước)
  const maxViewableWeekIndex = useMemo(() => {
    // 1. Nếu có các tuần đã hoàn thành, tuần tối đa là tuần sau tuần hoàn thành cuối cùng
    const completedWeeks = weeks.filter(w => w.status === 'Completed')
    if (completedWeeks.length > 0) {
      const lastFinishedIndex = Math.max(...completedWeeks.map(w => w.weekIndex))
      return lastFinishedIndex + 1
    }

    // 2. Nếu không có tuần nào hoàn thành nhưng có tuần đang học, chỉ cho phép xem tuần đó
    const inProgressIndex = weeks.find(w => w.status === 'InProgress')?.weekIndex
    if (inProgressIndex !== undefined) return inProgressIndex

    // 3. Nếu chưa có gì, mặc định là tuần đầu tiên
    if (weeks.length > 0) return weeks[0].weekIndex
    return 1
  }, [weeks])

  // Thống kê bài học của tuần đang chọn
  const weekStats = useMemo(() => {
    if (!activeWeek?.tasks) return { completed: 0, total: 0 }
    const tasks = activeWeek.tasks
    return {
      completed: tasks.filter(t => t.isCompleted).length,
      total: tasks.length
    }
  }, [activeWeek])

  const isActiveWeekNextToCreate = useMemo(() => {
    if (!activeWeek) return false
    const hasContent = Array.isArray(activeWeek.tasks) && activeWeek.tasks.length > 0
    const isFinished = activeWeek.status === 'Completed'
    const isInProgress = activeWeek.status === 'InProgress'
    return !isFinished && !isInProgress && !hasContent && activeWeek.weekIndex === maxViewableWeekIndex
  }, [activeWeek, maxViewableWeekIndex])

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.centerContent, { flex: 1, marginTop: 100 }]}>
          <ActivityIndicator size="large" color="#FFCF6C" />
          <Text style={styles.loadingText}>Đang chuẩn bị lộ trình của bạn...</Text>
        </View>
      </View>
    )
  }

  if (error || !roadmapData) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.centerContent, { flex: 1, marginTop: 100 }]}>
          <Text style={styles.errorText}>{error || 'Không thể tải lộ trình hiện tại.'}</Text>
          <RoadmapTestButton title="Thử lại ngay" onPress={onRetry} style={styles.retryButton} />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.wrapper}>

      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation */}
          <View style={styles.topNavigation}>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Học tập</Text>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Lộ trình cá nhân</Text>
            </View>
          </View>

          {/* Hero Header Section */}
          <View style={styles.heroSection}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <View style={styles.badgeRow}>
                  <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>{phaseLabel}</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: '#FF6B6B' }]}>
                    <Text style={styles.levelBadgeText}>Level{targetAim}</Text>
                  </View>
                </View>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.mainTitle}>Chương trình học tập của bạn</Text>
                  <Pressable
                    onPress={() => setIsInfoModalVisible(true)}
                    style={({ pressed }) => [styles.infoIconWrapper, pressed && styles.infoIconPressed]}
                  >
                    <Text style={styles.infoIconText}>i</Text>
                  </Pressable>
                </View>
                <Text style={styles.subtitle}>Thiết kế dựa trên kết quả đầu vào. Hãy chinh phục mục tiêu mỗi ngày!</Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={handleCancelRoadmap}
                  style={({ pressed }) => [styles.cancelIconButton, pressed && styles.cancelIconButtonPressed]}
                  disabled={isCancelling}
                >
                  <Text style={styles.cancelBtnText}>Hủy lộ trình</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsHistoryModalVisible(true)}
                  style={({ pressed }) => [styles.historyIconButton, pressed && styles.historyIconButtonPressed]}
                >
                  <HistoryIcon width={20} height={20} />
                  <Text style={styles.historyBtnText}>Lịch sử bài làm</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Main Dashboard - Sidebar Layout */}
          <View style={styles.dashboardContainer}>
            {/* Sidebar bên trái: Danh sách các tuần */}
            <View style={styles.weekSidebar}>
              <Text style={styles.sidebarTitle}>LỘ TRÌNH 13 TUẦN</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.sidebarContent}
                style={styles.sidebarScroll}
              >
                {weeks.map((week) => {
                  const isActive = week.weekIndex === activeWeekIndex
                  const isFinished = week.status === 'Completed'
                  const isInProgress = week.status === 'InProgress'

                  const hasContent = Array.isArray(week.tasks) && week.tasks.length > 0
                  const isNextWeek = week.weekIndex <= maxViewableWeekIndex

                  // Tuần "Tiếp theo" để tạo (Chưa có nội dung và nằm trong phạm vi được phép xem)
                  const isNextToCreate = !isFinished && !isInProgress && !hasContent && week.weekIndex === maxViewableWeekIndex

                  const isDisabled = !isFinished && !isInProgress && !hasContent && !isNextToCreate

                  return (
                    <Pressable
                      key={week.weekIndex}
                      onPress={() => !isDisabled && handleWeekChange(week.weekIndex)}
                      onHoverIn={() => Platform.OS === 'web' && !isDisabled && setHoveredWeekIndex(week.weekIndex)}
                      onHoverOut={() => Platform.OS === 'web' && setHoveredWeekIndex(null)}
                      disabled={isDisabled}
                      style={({ pressed }) => [
                        styles.sideWeekPill,
                        isActive && styles.sideWeekPillActive,
                        !isActive && !isDisabled && hoveredWeekIndex === week.weekIndex && styles.sideWeekPillHovered,
                        isFinished && styles.sideWeekPillFinished,
                        isDisabled && styles.sideWeekPillDisabled,
                        pressed && !isDisabled && styles.weekPillPressed,
                      ]}
                    >
                      <View style={styles.sideWeekHeader}>
                        <Text style={[styles.sideWeekText, isActive && styles.sideWeekTextActive, isDisabled && styles.sideWeekTextDisabled]}>
                          Tuần {week.weekIndex}
                        </Text>
                        {isFinished && <Text style={styles.weekCheck}>✓</Text>}
                        {isInProgress && !isActive && <View style={styles.inProgressSmallDot} />}
                        {isDisabled && <View style={styles.lockIcon} />}
                        {isNextToCreate && (
                          <View style={styles.nextToCreateBadge}>
                            <Text style={styles.nextToCreateText}>MỚI</Text>
                          </View>
                        )}
                      </View>

                      <View style={styles.sideWeekMiniProgress}>
                        <View
                          style={[
                            styles.sideWeekMiniProgressBar,
                            {
                              width: `${week.progressPercent || 0}%`,
                              backgroundColor: isDisabled ? '#EEE' : (isActive ? '#F4A950' : (isFinished ? '#4CAF50' : '#D1D1D1'))
                            }
                          ]}
                        />
                      </View>
                    </Pressable>
                  )
                })}
              </ScrollView>
            </View>

            {/* Content Card bên phải */}
            <View style={styles.contentCard}>
              <ScrollView style={styles.contentCardScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.contentCardInner}>
                  {/* Tóm tắt tuần đang chọn */}
                  <View style={styles.weekFocusArea}>
                    <View style={styles.weekFocusHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.weekFocusLabel}>NHIỆM VỤ TUẦN {activeWeekIndex}</Text>
                        <Text style={styles.weekFocusGoal} numberOfLines={2}>
                          {isActiveWeekNextToCreate
                            ? 'Vui lòng bấm tạo tuần tiếp theo'
                            : (activeWeek?.focusGoal || 'Duy trì phong độ học tập ổn định')}
                        </Text>
                      </View>
                      <View style={[
                        styles.statusBadge,
                        activeWeek?.status === 'InProgress'
                          ? styles.statusBadgeActive
                          : (activeWeek?.status === 'Completed'
                            ? styles.statusBadgeFinished
                            : (isActiveWeekNextToCreate ? styles.statusBadgeActive : styles.statusBadgePending))
                      ]}>
                        <Text style={[
                          styles.statusBadgeText,
                          activeWeek?.status === 'InProgress'
                            ? styles.statusBadgeTextActive
                            : (activeWeek?.status === 'Completed'
                              ? styles.statusBadgeTextFinished
                              : (isActiveWeekNextToCreate ? styles.statusBadgeTextActive : styles.statusBadgeTextPending))
                        ]}>
                          {activeWeek?.status === 'InProgress'
                            ? 'ĐANG HỌC'
                            : (activeWeek?.status === 'Completed' ? 'ĐÃ XONG' : (isActiveWeekNextToCreate ? 'SẴN SÀNG' : 'CHƯA ĐẾN'))}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.weekStatsRow}>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>
                          {activeWeek?.progressPercent != null
                            ? activeWeek.progressPercent
                            : Math.floor((weekStats.completed / (weekStats.total || 1)) * 100)}%
                        </Text>
                        <Text style={styles.statLabel}>Hoàn thành tuần</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{weekStats.completed}/{weekStats.total}</Text>
                        <Text style={styles.statLabel}>Tiến độ tuần</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.listWrapper}>
                    {activeWeek?.tasks?.length > 0 ? (
                      <RoadmapLearningDayList
                        hasWriting={hasWriting}
                        targetAim={targetAim}
                        weeks={weeks}
                        activeWeek={activeWeek}
                        initialDayIndex={initialDayIndex}
                        onGenerateNextWeek={handleGenerateNextWeek}
                        isNextWeekEmpty={!weeks.find(w => w.weekIndex === activeWeekIndex + 1) || (weeks.find(w => w.weekIndex === activeWeekIndex + 1)?.tasks?.length || 0) === 0}
                      />
                    ) : (
                      <View style={styles.emptyWeekContainer}>
                        <Text style={styles.emptyWeekTitle}>Tuần {activeWeekIndex} chưa có nội dung</Text>
                        <Text style={styles.emptyWeekSubtitle}>
                          Hãy nhấn nút bên dưới để hệ thống thiết kế chương trình học cho tuần này dựa trên kết quả thi tuần trước của bạn nhé!
                        </Text>
                        <RoadmapTestButton
                          title="Tạo tuần tiếp theo"
                          onPress={handleGenerateNextWeek}
                          disabled={isGeneratingNextWeek}
                          style={styles.generateButton}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>

      {/* Modals */}
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
                        <Text style={styles.statusText}>{activeWeek.status === 'Completed' ? 'Hoàn thành' : 'Đang diễn ra'}</Text>
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

      {/* Progress generating modal */}
      <Modal
        visible={isGeneratingNextWeek && !!progressData}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Đang tạo tuần mới của bạn</Text>
            <Text style={styles.progressStep}>{progressData?.step || 'Đang chuẩn bị...'}</Text>

            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressData?.percent || 0}%` },
                ]}
              />
            </View>

            <View style={styles.progressFooter}>
              <Text style={styles.progressPercent}>{progressData?.percent || 0}%</Text>
              <Text style={styles.progressNote}>Quá trình này có thể mất khoảng 1 phút. Vui lòng không đóng trang.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflow: 'hidden',
    }),
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainWrapper: {
    width: '95%',
    maxWidth: 1400,
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 20,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumbDivider: {
    fontSize: 13,
    color: '#EEE',
  },
  breadcrumbActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  heroSection: {
    gap: 20,
    paddingHorizontal: 4,
  },
  dashboardContainer: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  weekSidebar: {
    width: 250,
    height: '100%',
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarContent: {
    gap: 10,
    paddingBottom: 20,
  },
  sideWeekPill: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    gap: 8,
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.15s ease' }),
  },
  sideWeekPillActive: {
    borderColor: '#F4A950',
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(244,169,80,0.1)' }),
  },
  sideWeekPillHovered: {
    borderColor: '#F4A950',
    backgroundColor: '#FFFDF5',
  },
  sideWeekPillFinished: {
    backgroundColor: '#F1F9F1',
    borderColor: '#C8E6C9',
  },
  sideWeekPillDisabled: {
    backgroundColor: '#F9F9F9',
    borderColor: '#EEEEEE',
    opacity: 0.5,
  },
  sideWeekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sideWeekText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  sideWeekTextActive: {
    color: '#1A1A1A',
    fontWeight: '800',
  },
  sideWeekTextDisabled: {
    color: '#BBB',
  },
  sideWeekMiniProgressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  inProgressSmallDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F4A950',
  },
  sideWeekMiniProgress: {
    height: 3,
    backgroundColor: '#EEE',
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  sideWeekMiniProgressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  contentCard: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  contentCardScroll: {
    flex: 1,
  },
  contentCardInner: {
    padding: 32,
    gap: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerText: {
    flex: 1,
    gap: 8,
    minWidth: 300,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  phaseBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: '#1A1A1A',
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
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 40,
    letterSpacing: -1,
  },
  infoIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }),
  },
  infoIconPressed: {
    backgroundColor: '#F5F5F5',
  },
  infoIconText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#999',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: 600,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 100,
    backgroundColor: '#F4A950',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(244,169,80,0.2)' }),
  },
  historyBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  historyIconButtonPressed: {
    backgroundColor: '#D38E3F',
    transform: [{ scale: 0.96 }]
  },
  cancelIconButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FFA39E',
    marginRight: 10,
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.15s ease' }),
  },
  cancelIconButtonPressed: {
    backgroundColor: '#FFCCC7',
    transform: [{ scale: 0.96 }]
  },
  cancelBtnText: {
    color: '#F5222D',
    fontSize: 14,
    fontWeight: '600',
  },
  weekPillPressed: {
    transform: [{ scale: 0.98 }],
  },
  weekCheck: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '900',
  },
  lockIcon: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#BBB',
  },
  nextToCreateBadge: {
    backgroundColor: '#FFF8E1',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  nextToCreateText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F57C00',
    letterSpacing: 0.5,
  },
  weekFocusArea: {
    gap: 16,
    marginBottom: 8,
  },
  weekFocusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
  },
  weekFocusLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1.5,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  weekFocusGoal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 4,
    borderWidth: 1,
  },
  statusBadgeActive: {
    backgroundColor: '#FFF8F0',
    borderColor: '#F4A950',
  },
  statusBadgeFinished: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
  },
  statusBadgePending: {
    backgroundColor: '#F5F5F5',
    borderColor: '#EEE',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statusBadgeTextActive: {
    color: '#D38E3F',
  },
  statusBadgeTextFinished: {
    color: '#388E3C',
  },
  statusBadgeTextPending: {
    color: '#999',
  },
  weekStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginTop: 8,
  },
  statBox: {
    gap: 4,
  },
  statVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#EEEEEE',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 20,
  },
  listWrapper: {
    flex: 1,
    minHeight: 300,
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
    padding: 24,
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
    padding: 24,
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
    paddingHorizontal: 12,
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
  emptyWeekContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
    gap: 16,
  },
  emptyWeekTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  emptyWeekSubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 450,
    marginBottom: 10,
  },
  generateButton: {
    minWidth: 200,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    gap: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }),
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  progressStep: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    minHeight: 44,
  },
  progressBarWrapper: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F4A950',
    borderRadius: 6,
  },
  progressFooter: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F4A950',
  },
  progressNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
})
