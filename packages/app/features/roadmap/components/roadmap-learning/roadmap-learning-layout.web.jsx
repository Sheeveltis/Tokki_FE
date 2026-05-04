import { useMemo, useState, useEffect, useCallback, useRef } from 'react'
import { StyleSheet, Text, View, Pressable, Modal, ActivityIndicator, Platform, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import LockIcon from '../../../../../assets/icon/icon-mainflow/lock.svg'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'
import { RoadmapExamHistoryModal } from './roadmap-exam-history-modal.web'
import HistoryIcon from '../../../../../assets/icon/icon-roadmap/history.svg'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { Alert } from 'react-native'
import { HistoryOutlined, CalendarOutlined } from '@ant-design/icons'

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
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [isVipModalVisible, setIsVipModalVisible] = useState(false)

  const fetchUserRole = useCallback(async () => {
    try {
      const response = await apiClient.get(ENDPOINTS.ACCOUNT.CURRENT_ROLE)
      setCurrentUserRole(response?.data?.role)
    } catch (err) {
      console.error('Failed to fetch user role:', err)
    }
  }, [])

  useEffect(() => {
    fetchUserRole()
  }, [fetchUserRole])

  // ĐỔI MỚI: Quản lý tuần hiện tại
  const [activeWeekIndex, setActiveWeekIndex] = useState(null)
  const [activeDay, setActiveDay] = useState(null)
  const [hoveredWeekIndex, setHoveredWeekIndex] = useState(null)
  const [hoveredDay, setHoveredDay] = useState(null)
  const [isHoveredTitle, setIsHoveredTitle] = useState(false)
  const [isHoveredHistory, setIsHoveredHistory] = useState(false)
  const [isHoveredCancel, setIsHoveredCancel] = useState(false)
  const [isHoveredInfo, setIsHoveredInfo] = useState(false)
  const [hoveredWeekTop, setHoveredWeekTop] = useState(0)
  const sidebarRef = useRef(null)

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
    // Kiểm tra quyền (Role 1 hoặc 3 mới được tạo tiếp)
    let role = currentUserRole
    if (role === null || role === undefined) {
      try {
        const response = await apiClient.get(ENDPOINTS.ACCOUNT.CURRENT_ROLE)
        role = response?.data?.role
        setCurrentUserRole(role)
      } catch (err) {
        console.error('Failed to verify user role:', err)
      }
    }

    if (role !== 1 && role !== 3) {
      if (Platform.OS === 'web') {
        setIsVipModalVisible(true)
      } else {
        Alert.alert(
          'Yêu cầu nâng cấp VIP',
          'Vui lòng nâng cấp VIP để tạo tiếp lộ trình học tập.',
          [
            { text: 'Để sau', style: 'cancel' },
            { text: 'Nâng cấp ngay', onPress: () => router.push('/payment-package'), style: 'default' }
          ]
        )
      }
      return
    }

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
        if (Platform.OS === 'web') {
          setIsVipModalVisible(true)
        } else {
          Alert.alert(
            'Yêu cầu nâng cấp VIP',
            'Tính năng tự động thiết kế lộ trình học tập nâng cao chỉ dành cho thành viên VIP. Bạn có muốn nâng cấp ngay không?',
            [
              { text: 'Để sau', style: 'cancel' },
              { text: 'Nâng cấp ngay', onPress: () => router.push('/payment-package'), style: 'default' }
            ]
          )
        }
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
    // 1. Nếu có các tuần đã hoàn thành (theo status backend), 
    // tuần tối đa ít nhất là tuần sau tuần hoàn thành cuối cùng
    const completedWeeks = weeks.filter(w => w.status === 'Completed')
    let baseIndex = 0
    if (completedWeeks.length > 0) {
      baseIndex = Math.max(...completedWeeks.map(w => w.weekIndex))
    }

    // 2. Kiểm tra tuần đang học: Nếu đã hoàn thành bài tập của Ngày 7 (Bài kiểm tra tuần) 
    // thì cho phép mở khóa tuần tiếp theo để người dùng nhấn "Tạo"
    const inProgressWeek = weeks.find(w => w.status === 'InProgress')
    if (inProgressWeek) {
      const tasks = inProgressWeek.tasks || []
      const day7Tasks = tasks.filter(t => t.dayIndex === 7)
      const isDay7Done = day7Tasks.length > 0 && day7Tasks.every(t => t.isCompleted)

      if (isDay7Done) {
        baseIndex = Math.max(baseIndex, inProgressWeek.weekIndex)
      } else {
        baseIndex = Math.max(baseIndex, inProgressWeek.weekIndex - 1)
      }
    }

    // Kết quả là tuần sau mốc đã hoàn thành
    if (weeks.length > 0) return Math.max(weeks[0].weekIndex, baseIndex + 1)
    return 1
  }, [weeks])

  // Thống kê bài học của tuần đang chọn
  const { weekStats, dayKeys } = useMemo(() => {
    const tasks = Array.isArray(activeWeek?.tasks) ? activeWeek.tasks : []
    const stats = {
      completed: tasks.filter(t => t.isCompleted).length,
      total: tasks.length
    }

    const lessonsByDay = tasks.reduce((acc, task) => {
      const dayIndex = task.dayIndex || 1
      if (!acc[dayIndex]) acc[dayIndex] = []
      acc[dayIndex].push(task)
      return acc
    }, {})

    const keys = Object.keys(lessonsByDay).map(Number).sort((a, b) => a - b)

    return { weekStats: stats, dayKeys: keys }
  }, [activeWeek])

  const handleDayChange = (day) => {
    setActiveDay(day)
    router.replace(`/roadmap/learning?week=${activeWeekIndex}&day=${day}`, undefined, { shallow: true })
  }

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
                  <View style={styles.infoBtnContainer}>
                    <Pressable
                      onPress={() => setIsInfoModalVisible(true)}
                      onHoverIn={() => Platform.OS === 'web' && setIsHoveredInfo(true)}
                      onHoverOut={() => Platform.OS === 'web' && setIsHoveredInfo(false)}
                      style={({ pressed }) => [styles.infoIconWrapper, pressed && styles.infoIconPressed]}
                    >
                      <Text style={styles.infoIconText}>i</Text>
                    </Pressable>
                    {isHoveredInfo && (
                      <View style={styles.infoTooltip}>
                        <View style={styles.tooltipArrow} />
                        <Text style={styles.infoTooltipText}>Xem thông tin tiêu điểm tuần này</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.subtitle}>Thiết kế dựa trên kết quả đầu vào. Hãy chinh phục mục tiêu mỗi ngày!</Text>
              </View>

              <View style={styles.headerActions}>
                <Pressable
                  onPress={handleCancelRoadmap}
                  onHoverIn={() => Platform.OS === 'web' && setIsHoveredCancel(true)}
                  onHoverOut={() => Platform.OS === 'web' && setIsHoveredCancel(false)}
                  style={({ pressed }) => [
                    styles.cancelIconButton,
                    isHoveredCancel && styles.cancelIconButtonHovered,
                    pressed && styles.cancelIconButtonPressed
                  ]}
                  disabled={isCancelling}
                >
                  <Text style={styles.cancelBtnText}>Hủy lộ trình</Text>
                </Pressable>

                <Pressable
                  onPress={() => setIsHistoryModalVisible(true)}
                  onHoverIn={() => Platform.OS === 'web' && setIsHoveredHistory(true)}
                  onHoverOut={() => Platform.OS === 'web' && setIsHoveredHistory(false)}
                  style={({ pressed }) => [
                    styles.historyIconButton,
                    isHoveredHistory && styles.historyIconButtonHovered,
                    pressed && styles.historyIconButtonPressed
                  ]}
                >
                  <HistoryOutlined style={{ color: isHoveredHistory ? '#FFF' : '#F4A950', fontSize: 18 }} />
                  <Text style={[styles.historyBtnText, isHoveredHistory && styles.historyBtnTextHovered]}>Lịch sử bài làm</Text>
                </Pressable>
              </View>
            </View>
          </View>

          {/* Main Dashboard - Sidebar Layout */}
          <View style={[styles.dashboardContainer, { flexDirection: 'row-reverse' }]}>
            {/* Content Card bên phải (nhưng đứng trước trong DOM để sidebar đè lên) */}
            <View style={styles.contentCard}>
              <View style={styles.contentCardInner}>
                {/* Tóm tắt tuần đang chọn */}
                <View style={styles.weekFocusArea}>
                  <View style={styles.weekTitleRow}>
                    <Pressable
                      onHoverIn={() => Platform.OS === 'web' && setIsHoveredTitle(true)}
                      onHoverOut={() => Platform.OS === 'web' && setIsHoveredTitle(false)}
                      style={{ position: 'relative' }}
                    >
                      <Text style={styles.weekTitleText} numberOfLines={1}>
                        NHIỆM VỤ TUẦN {activeWeekIndex}: {isActiveWeekNextToCreate
                          ? 'Vui lòng bấm tạo tuần tiếp theo'
                          : (activeWeek?.focusGoal || 'Duy trì phong độ học tập ổn định')}
                      </Text>
                      {isHoveredTitle && (
                        <View style={styles.titleTooltip}>
                          <Text style={styles.titleTooltipText}>
                            NHIỆM VỤ TUẦN {activeWeekIndex}: {isActiveWeekNextToCreate
                              ? 'Vui lòng bấm tạo tuần tiếp theo'
                              : (activeWeek?.focusGoal || 'Duy trì phong độ học tập ổn định')}
                          </Text>
                          <View style={styles.tooltipArrowDown} />
                        </View>
                      )}
                    </Pressable>
                  </View>
                  <View style={styles.headerTopRow}>
                    <View style={styles.statsContainer}>
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>
                          {activeWeek?.progressPercent != null
                            ? activeWeek.progressPercent
                            : Math.floor((weekStats.completed / (weekStats.total || 1)) * 100)}%
                        </Text>
                        <Text style={styles.statLabel}>HOÀN THÀNH TUẦN</Text>
                      </View>
                      <View style={styles.statDivider} />
                      <View style={styles.statBox}>
                        <Text style={styles.statVal}>{weekStats.completed}/{weekStats.total}</Text>
                        <Text style={styles.statLabel}>TIẾN ĐỘ TUẦN</Text>
                      </View>
                    </View>

                    {dayKeys.length > 0 && (
                      <View style={styles.daySelectorContainer}>
                        <View style={styles.dayPillsRow}>
                          {dayKeys.map((day) => {
                            const active = activeDay === day
                            return (
                              <Pressable
                                key={day}
                                onPress={() => handleDayChange(day)}
                                onHoverIn={() => Platform.OS === 'web' && setHoveredDay(day)}
                                onHoverOut={() => Platform.OS === 'web' && setHoveredDay(null)}
                                style={({ pressed }) => [
                                  styles.dayPillSmall,
                                  active && styles.dayPillSmallActive,
                                  day === 7 && !active && styles.day7Pill,
                                  day === 7 && active && styles.day7PillActive,
                                  !active && hoveredDay === day && { backgroundColor: '#E8E8E8' },
                                  pressed && { transform: [{ scale: 0.95 }] }
                                ]}
                              >
                                <Text style={[
                                  styles.dayPillSmallText,
                                  active && styles.dayPillSmallTextActive,
                                  day === 7 && active && { color: '#FFFFFF' },
                                  day === 7 && !active && { color: '#D48806' }
                                ]}>
                                  {day === 7 ? 'Ngày 7' : `Ngày ${day}`}
                                </Text>
                              </Pressable>
                            )
                          })}
                        </View>
                      </View>
                    )}
                  </View>

                  <View style={styles.weekProgressBarArea}>
                    <View
                      style={[
                        styles.weekProgressBarFill,
                        {
                          width: `${activeWeek?.progressPercent != null
                            ? activeWeek.progressPercent
                            : Math.floor((weekStats.completed / (weekStats.total || 1)) * 100)}%`
                        }
                      ]}
                    />
                  </View>
                </View>


                <ScrollView
                  style={styles.listWrapper}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {activeWeek?.tasks?.length > 0 ? (
                    <RoadmapLearningDayList
                      hasWriting={hasWriting}
                      targetAim={targetAim}
                      weeks={weeks}
                      activeWeek={activeWeek}
                      initialDayIndex={initialDayIndex}
                      activeDay={activeDay}
                      onDayChange={setActiveDay}
                      hideSelector={true}
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
                </ScrollView>
              </View>
            </View>

            {/* Sidebar bên trái (nhưng đứng sau trong DOM để đè lên content card) */}
            <View style={styles.weekSidebar} ref={sidebarRef}>
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
                      onHoverIn={(e) => {
                        if (Platform.OS === 'web') {
                          setHoveredWeekIndex(week.weekIndex)
                          if (e.currentTarget && sidebarRef.current) {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const parentRect = sidebarRef.current.getBoundingClientRect()
                            setHoveredWeekTop(rect.top - parentRect.top)
                          }
                        }
                      }}
                      onHoverOut={() => Platform.OS === 'web' && setHoveredWeekIndex(null)}
                      disabled={false} // Allow hover on disabled weeks to show tooltip
                      style={({ pressed }) => [
                        styles.sideWeekPill,
                        isActive && styles.sideWeekPillActive,
                        isNextToCreate && styles.sideWeekPillNextToCreate,
                        !isActive && !isDisabled && hoveredWeekIndex === week.weekIndex && styles.sideWeekPillHovered,
                        !isActive && isDisabled && hoveredWeekIndex === week.weekIndex && { zIndex: 20 },
                        isFinished && styles.sideWeekPillFinished,
                        isDisabled && styles.sideWeekPillDisabled,
                        pressed && !isDisabled && styles.weekPillPressed,
                      ]}
                    >
                      <View style={styles.sideWeekHeader}>
                        <Text style={[
                          styles.sideWeekText,
                          isActive && styles.sideWeekTextActive,
                          isNextToCreate && styles.sideWeekTextNext,
                          isDisabled && styles.sideWeekTextDisabled
                        ]}>
                          Tuần {week.weekIndex}
                        </Text>
                        {isFinished && <Text style={styles.weekCheck}>✓</Text>}
                        {isInProgress && !isActive && <View style={styles.inProgressSmallDot} />}
                        {isDisabled && <LockIcon width={24} height={24} color="#D1D1D1" />}
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

              {/* Tooltip rendered OUTSIDE the ScrollView to avoid clipping */}
              {Platform.OS === 'web' && hoveredWeekIndex !== null && (
                (() => {
                  const week = weeks.find(w => w.weekIndex === hoveredWeekIndex)
                  const isFinished = week?.status === 'Completed'
                  const isInProgress = week?.status === 'InProgress'
                  const hasContent = Array.isArray(week?.tasks) && week.tasks.length > 0
                  const isNextToCreate = !isFinished && !isInProgress && !hasContent && week?.weekIndex === maxViewableWeekIndex
                  const isActuallyDisabled = !isFinished && !isInProgress && !hasContent && !isNextToCreate

                  if (isActuallyDisabled) {
                    return (
                      <View style={[styles.lockedTooltip, { top: hoveredWeekTop }]}>
                        <View style={styles.tooltipArrowLeft} />
                        <Text style={styles.lockedTooltipText}>
                          Hiện tại chưa mở khóa, vui lòng hoàn thành bài kiểm tra cuối tuần hiện tại để mở khóa
                        </Text>
                      </View>
                    )
                  }
                  return null
                })()
              )}
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

      {/* VIP Upgrade Modal */}
      <Modal visible={isVipModalVisible} transparent animationType="fade" onRequestClose={() => setIsVipModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setIsVipModalVisible(false)}>
          <Pressable style={styles.vipModalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.vipIconContainer}>
              <Text style={styles.vipIcon}>👑</Text>
            </View>

            <Text style={styles.vipModalTitle}>Yêu cầu nâng cấp VIP</Text>
            <Text style={styles.vipModalText}>
              Tính năng thiết kế lộ trình học tập nâng cao bằng AI chỉ dành cho thành viên VIP.
              Hãy nâng cấp ngay để tiếp tục hành trình chinh phục mục tiêu của bạn!
            </Text>

            <View style={styles.vipModalActions}>
              <Pressable
                onPress={() => setIsVipModalVisible(false)}
                style={({ pressed }) => [styles.vipCancelBtn, pressed && styles.vipBtnPressed]}
              >
                <Text style={styles.vipCancelBtnText}>Để sau</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsVipModalVisible(false)
                  router.push('/payment-package')
                }}
                style={({ pressed }) => [styles.vipUpgradeBtn, pressed && styles.vipBtnPressed]}
              >
                <Text style={styles.vipUpgradeBtnText}>Nâng cấp ngay</Text>
              </Pressable>
            </View>
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
    paddingBottom: 10,
    zIndex: 1,
    position: 'relative',
  },
  weekSidebar: {
    width: 250,
    height: '100%',
    zIndex: 100,
    ...(Platform.OS === 'web' && { overflow: 'visible', position: 'relative' }),
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#444',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  sidebarScroll: {
    flex: 1,
    ...(Platform.OS === 'web' && { overflow: 'visible', zIndex: 100, position: 'relative' }),
  },
  sidebarContent: {
    gap: 12,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
    ...(Platform.OS === 'web' && { overflow: 'visible' }),
  },
  sideWeekPill: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    gap: 8,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      overflow: 'visible'
    }),
  },
  sideWeekPillActive: {
    borderColor: '#F4A950',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px rgba(244,169,80,0.15)',
      transform: [{ scale: 1.02 }],
    }),
  },
  sideWeekPillHovered: {
    borderColor: '#F4A950',
    backgroundColor: '#FFFDF5',
    zIndex: 20,
  },
  sideWeekPillFinished: {
    backgroundColor: '#F1F9F1',
    borderColor: '#C8E6C9',
  },
  sideWeekPillDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EEEEEE',
    opacity: 0.8,
  },
  sideWeekPillNextToCreate: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
    borderStyle: 'dashed',
    borderWidth: 2,
    opacity: 1,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(74,144,226,0.1)',
    }),
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
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  sideWeekTextActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  sideWeekTextNext: {
    color: '#2C5282',
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
    zIndex: 1,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 40px rgba(0,0,0,0.03)',
      position: 'relative',
      overflow: 'visible'
    }),
    ...(Platform.OS !== 'web' && { overflow: 'hidden' }),
  },
  contentCardScroll: {
    flex: 1,
  },
  contentCardInner: {
    padding: 32,
    gap: 0,
    flex: 1,
    zIndex: 10,
    ...(Platform.OS === 'web' && { overflow: 'visible' }),
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
    fontWeight: '800',
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
  infoBtnContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTooltip: {
    position: 'absolute',
    left: '100%',
    marginLeft: 12,
    backgroundColor: '#333',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    width: 220,
    zIndex: 100,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      animation: 'fadeIn 0.2s ease-out'
    }),
  },
  tooltipArrow: {
    position: 'absolute',
    left: -6,
    top: '50%',
    marginTop: -6,
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderTopColor: 'transparent',
    borderBottomWidth: 6,
    borderBottomColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: '#333',
  },
  infoTooltipText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  infoIconPressed: {
    backgroundColor: '#F5F5F5',
  },
  infoIconText: {
    fontSize: 14,
    fontWeight: '700',
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
  lockedTooltip: {
    position: 'absolute',
    left: '100%',
    marginLeft: 15,
    top: 5,
    backgroundColor: '#333333',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    width: 300,
    zIndex: 9999,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      animation: 'fadeIn 0.2s ease-out',
      pointerEvents: 'none'
    }),
  },
  lockedTooltipText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '100',
    textAlign: 'left',
    fontFamily: 'Epilogue, sans-serif',
  },
  tooltipArrowLeft: {
    position: 'absolute',
    left: -8,
    top: '50%',
    marginTop: -8,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: 'transparent',
    borderBottomWidth: 8,
    borderBottomColor: 'transparent',
    borderRightWidth: 8,
    borderRightColor: '#333333',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#F4A950',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 4px 12px rgba(244,169,80,0.1)',
    }),
  },
  historyBtnText: {
    color: '#F4A950',
    fontSize: 14,
    fontWeight: '700',
  },
  historyIconButtonHovered: {
    backgroundColor: '#F4A950',
    borderColor: '#F4A950',
    boxShadow: '0 8px 16px rgba(244,169,80,0.25)',
  },
  historyBtnTextHovered: {
    color: '#FFFFFF',
  },
  historyIconButtonPressed: {
    backgroundColor: '#FFF8F0',
    transform: [{ scale: 0.96 }]
  },
  cancelIconButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.1s ease' }),
  },
  cancelIconButtonHovered: {
    backgroundColor: '#FFF1F0',
    borderColor: '#FFA39E',
  },
  cancelIconButtonPressed: {
    backgroundColor: '#EEEEEE',
    transform: [{ scale: 0.96 }]
  },
  cancelBtnText: {
    color: '#888',
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
  nextToCreateBadge: {
    backgroundColor: '#EBF8FF',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#90CDF4',
  },
  nextToCreateText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#2B6CB0',
    letterSpacing: 0.5,
  },
  weekFocusArea: {
    gap: 16,
    marginBottom: 8,
    zIndex: 100,
    ...(Platform.OS === 'web' && { overflow: 'visible' }),
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
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 28,
    letterSpacing: -0.5,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  statLabel: {
    fontSize: 15,
    color: '#888',
    fontWeight: '600',
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
    marginTop: 30,
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
  },
  weekTitleRow: {
    paddingTop: 8,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  weekTitleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 40,
  },
  daySelectorContainer: {
    alignItems: 'flex-end',
    gap: 10,
  },
  calendarLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
    marginRight: 4,
  },
  calendarLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 0.5,
    fontFamily: 'Epilogue, sans-serif',
  },
  dayPillsRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    padding: 4,
    borderRadius: 14,
    gap: 2,
  },
  dayPillSmall: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 11,
    ...(Platform.OS === 'web' && { cursor: 'pointer', transition: 'all 0.2s' }),
  },
  dayPillSmallActive: {
    backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }),
  },
  dayPillSmallText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  dayPillSmallTextActive: {
    color: '#1A1A1A',
    fontWeight: '800',
  },
  day7Pill: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF1F0',
    borderWidth: 1.5,
  },
  day7Pill: {
    borderColor: '#FFC53D',
    backgroundColor: '#FFFBE6',
    borderWidth: 1.5,
  },
  day7PillActive: {
    backgroundColor: '#FFC53D',
    borderColor: '#FFC53D',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(255,197,61,0.3)' }),
  },
  weekProgressBarArea: {
    width: '100%',
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 100,
    marginTop: 20,
    overflow: 'hidden',
  },
  weekProgressBarFill: {
    height: '100%',
    backgroundColor: '#F4A950',
    borderRadius: 100,
  },
  listWrapper: {
    flex: 1,
    marginTop: 20,
    ...(Platform.OS === 'web' && { overflowY: 'auto' }),
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
    fontSize: 30,
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
  vipModalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }),
  },
  vipIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  vipIcon: {
    fontSize: 40,
  },
  vipModalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 16,
    textAlign: 'center',
  },
  vipModalText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'Epilogue, sans-serif',
  },
  vipModalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  vipCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  vipCancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  vipUpgradeBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F4A950',
    alignItems: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(244,169,80,0.25)' }),
  },
  vipUpgradeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  vipBtnPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  titleTooltip: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    width: 450,
    zIndex: 9999,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }),
  },
  titleTooltipText: {
    color: '#FFF',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  tooltipArrowDown: {
    position: 'absolute',
    bottom: -6,
    left: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    borderRightWidth: 6,
    borderRightColor: 'transparent',
    borderTopWidth: 6,
    borderTopColor: '#1A1A1A',
  },
})
