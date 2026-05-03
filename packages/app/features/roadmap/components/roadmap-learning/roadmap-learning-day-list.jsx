import { useMemo, useState, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View, Platform, ScrollView } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapLearningLessonCard } from './roadmap-learning-lesson-card'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'

import ListeningIcon from '../../../../../assets/icon/icon-roadmap/headphones-round-sound-svgrepo-com.svg'
import ReadingIcon from '../../../../../assets/icon/navigate-app/book.svg'
import WritingIcon from '../../../../../assets/icon/icon-mainflow/write.svg'

const TASK_TYPE_CONFIG = {
  LearnTheory: { actionLabel: 'Học lý thuyết', tone: 'primary' },
  VirtualQuiz: { actionLabel: 'Luyện tập', tone: 'secondary' },
  WeeklyExam: { actionLabel: 'Thi thử tuần', tone: 'trial' },
  0: { actionLabel: 'Học lý thuyết', tone: 'primary' },
  1: { actionLabel: 'Luyện tập', tone: 'secondary' },
  2: { actionLabel: 'Thi thử tuần', tone: 'trial' },
}

const normalizeTaskType = (taskType) => {
  if (taskType === 0 || taskType === '0') return 0
  if (taskType === 1 || taskType === '1') return 1
  if (taskType === 2 || taskType === '2') return 2
  return taskType
}

const getSkillKey = (task = {}) => {
  const skill = String(task.skill || '').toLowerCase()
  if (skill.includes('listen')) return 'listening'
  if (skill.includes('read')) return 'reading'
  if (skill.includes('writ')) return 'writing'

  const title = String(task.title || '').toLowerCase()
  if (title.includes('nghe')) return 'listening'
  if (title.includes('đọc') || title.includes('doc')) return 'reading'
  if (title.includes('viết') || title.includes('viet')) return 'writing'

  return 'reading'
}

const buildLessonsFromTasks = (tasks = [], hasWriting) =>
  tasks
    .map((task) => {
      const normalizedType = normalizeTaskType(task.taskType)
      const config = TASK_TYPE_CONFIG[normalizedType] || TASK_TYPE_CONFIG.VirtualQuiz
      const skillKey = getSkillKey(task)

      if (!hasWriting && skillKey === 'writing') return null

      const skillLabel = skillKey === 'listening' ? 'Nghe' : skillKey === 'reading' ? 'Đọc' : 'Viết'
      const skillIcon = skillKey === 'listening' ? ListeningIcon : skillKey === 'reading' ? ReadingIcon : WritingIcon

      return {
        id: task.taskId,
        icon: skillIcon,
        title: task.title,
        subtitle: `${skillLabel} • ${config.actionLabel}`,
        actionLabel: task.isCompleted ? 'Đã hoàn thành' : config.actionLabel,
        tone: task.isCompleted ? 'primary' : config.tone,
        taskType: normalizedType,
        examId: task.examId,
        isCompleted: task.isCompleted,
      }
    })
    .filter(Boolean)

export function RoadmapLearningDayList({ 
  hasWriting, 
  targetAim = 1, 
  weeks = [], 
  activeWeek, 
  initialDayIndex = null,
  activeDay: externalActiveDay = null,
  onDayChange: externalOnDayChange = null,
  onGenerateNextWeek,
  isNextWeekEmpty = false,
  hideSelector = false
}) {
  const router = useRouter()

  const lessonsByDay = useMemo(() => {
    const tasks = Array.isArray(activeWeek?.tasks) ? activeWeek.tasks : []
    if (!tasks.length) return {}

    return tasks.reduce((acc, task) => {
      const dayIndex = task.dayIndex || 1
      if (!acc[dayIndex]) acc[dayIndex] = []
      acc[dayIndex].push(task)
      return acc
    }, {})
  }, [activeWeek])

  const dayKeys = useMemo(() => Object.keys(lessonsByDay).map(Number).sort((a, b) => a - b), [lessonsByDay])
  const [internalActiveDay, setInternalActiveDay] = useState(null)
  
  const activeDay = externalActiveDay !== null ? externalActiveDay : internalActiveDay
  const setActiveDay = externalOnDayChange || setInternalActiveDay

  const [hoveredDay, setHoveredDay] = useState(null)

  // Khởi tạo ngày đang học hoặc ngày từ URL
  useEffect(() => {
    if (dayKeys.length > 0 && activeDay === null) {
      if (initialDayIndex !== null && dayKeys.includes(initialDayIndex)) {
        setActiveDay(initialDayIndex)
      } else {
        setActiveDay(dayKeys[0])
      }
    }
  }, [dayKeys, initialDayIndex, activeDay, setActiveDay])

  const handleDayChange = (day) => {
    setActiveDay(day)
    // Sync URL: giữ lại weekIndex hiện tại nếu có
    const currentWeek = activeWeek?.weekIndex || 1
    router.replace(`/roadmap/learning?week=${currentWeek}&day=${day}`, undefined, { shallow: true })
  }

  const activeDayLessons = useMemo(() => {
    const tasks = lessonsByDay[activeDay] || []
    return buildLessonsFromTasks(tasks, hasWriting)
  }, [lessonsByDay, activeDay, hasWriting])

  return (
    <View style={styles.wrapper}>
      {dayKeys.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Chưa có nội dung học cho tuần hiện tại.</Text>
        </View>
      ) : (
        <>
          {!hideSelector && (
            <View style={styles.daySelector}>
              {dayKeys.map((day) => {
                const active = activeDay === day
                return (
                  <Pressable
                    key={day}
                    onPress={() => handleDayChange(day)}
                    onHoverIn={() => Platform.OS === 'web' && setHoveredDay(day)}
                    onHoverOut={() => Platform.OS === 'web' && setHoveredDay(null)}
                    style={({ pressed }) => [
                      styles.dayPill,
                      active && styles.dayPillActive,
                      !active && hoveredDay === day && styles.dayPillHovered,
                      pressed && styles.dayPillPressed
                    ]}
                  >
                    <Text style={[
                      styles.dayPillText,
                      active && styles.dayPillTextActive,
                      (!active && hoveredDay === day) && styles.dayPillTextHovered
                    ]}>Ngày {day}</Text>
                  </Pressable>
                )
              })}
            </View>
          )}


          <View style={styles.lessonPanel}>
            {activeDayLessons.map((lesson) => {
              const allTaskIds = activeDayLessons.map((l) => l.id).join(',')
              const targetPath = `/roadmap/learning/tips/${lesson.id}?level=${targetAim}&roadmap=${allTaskIds}`

              // Bài kiểm ngày 7 (WeeklyExam) đã hoàn thành => khóa hoàn toàn, không cho vào lại
              const isWeeklyExam = lesson.taskType === 2 || lesson.taskType === 'WeeklyExam'
              const isLocked = isWeeklyExam && lesson.isCompleted

              return (
                <RoadmapLearningLessonCard
                  key={`${lesson.id}-detail`}
                  icon={lesson.icon}
                  title={lesson.title}
                  subtitle={lesson.subtitle}
                  actionLabel={lesson.actionLabel}
                  tone={lesson.tone}
                  isCompleted={lesson.isCompleted}
                  isLocked={isLocked}
                  onPress={isLocked ? null : () => router.push(targetPath)}
                />
              )
            })}
            {activeDay === 7 && isNextWeekEmpty && activeDayLessons.every(l => l.isCompleted) && (
              <View style={styles.nextWeekAction}>
                <View style={styles.actionDivider} />
                <Text style={styles.actionNote}>Bạn đã hoàn thành tuần học này! Hãy tạo nội dung cho tuần kế tiếp nhé.</Text>
                <RoadmapTestButton 
                  title="Tạo tuần tiếp theo" 
                  onPress={onGenerateNextWeek}
                  style={styles.nextWeekBtn}
                />
              </View>
            )}
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, minHeight: 0, gap: 10 },
  daySelector: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  dayPill: {
    paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14, borderWidth: 1.5, borderColor: '#F0F0F0', backgroundColor: '#FFFFFF',
    ...(Platform.OS === 'web' && { 
      transition: 'all 0.2s ease', 
      cursor: 'pointer' 
    }),
  },
  dayPillActive: { 
    backgroundColor: '#1A1A1A', 
    borderColor: '#1A1A1A',
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 6px 15px rgba(0,0,0,0.15)',
    }),
  },
  dayPillHovered: { backgroundColor: '#F8F9FA', borderColor: '#1A1A1A' },
  dayPillPressed: { transform: [{ scale: 0.96 }] },
  dayPillText: { fontSize: 13, fontWeight: '700', color: '#888', fontFamily: 'Epilogue, sans-serif' },
  dayPillTextActive: { color: '#FFFFFF', fontWeight: '800' },
  dayPillTextHovered: { color: '#1A1A1A' },
  lessonPanel: {
    flex: 1, 
    minHeight: 0, 
    gap: 12,
  },
  lessonPanelTitle: { fontSize: 13, fontWeight: '800', color: '#D38E3F', fontFamily: 'Epilogue, sans-serif', textTransform: 'uppercase', letterSpacing: 1 },
  lessonColumn: { gap: 12, paddingBottom: 10 },
  emptyBox: {
    flex: 1, minHeight: 0, borderRadius: 18, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, color: '#999', fontFamily: 'Epilogue, sans-serif' },
  nextWeekAction: {
    marginTop: 10,
    gap: 12,
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    width: '100%',
    marginBottom: 8,
  },
  actionNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
    maxWidth: 300,
  },
  nextWeekBtn: {
    minWidth: 200,
  }
})
