import { useMemo, useState, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapLearningLessonCard } from './roadmap-learning-lesson-card'

import ListeningIcon from '../../../../../assets/icon/icon-roadmap/headphones-round-sound-svgrepo-com.svg'
import ReadingIcon from '../../../../../assets/icon/navigate-app/book.svg'
import WritingIcon from '../../../../../assets/icon/icon-mainflow/write.svg'

const TASK_TYPE_CONFIG = {
  LearnTheory: { actionLabel: 'Học lý thuyết', tone: 'primary' },
  VirtualQuiz: { actionLabel: 'Luyện tập', tone: 'secondary' },
  WeeklyExam: { actionLabel: 'Thi thử tuần', tone: 'secondary' },
  0: { actionLabel: 'Học lý thuyết', tone: 'primary' },
  1: { actionLabel: 'Luyện tập', tone: 'secondary' },
  2: { actionLabel: 'Thi thử tuần', tone: 'secondary' },
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

export function RoadmapLearningDayList({ hasWriting, targetAim = 1, weeks = [], activeWeek }) {
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
  const [activeDay, setActiveDay] = useState(dayKeys[0] || 1)

  useEffect(() => {
    if (!dayKeys.length) return
    if (!dayKeys.includes(activeDay)) setActiveDay(dayKeys[0])
  }, [dayKeys, activeDay])

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
          <View style={styles.daySelector}>
            {dayKeys.map((day) => {
              const active = activeDay === day
              return (
                <Pressable
                  key={day}
                  onPress={() => setActiveDay(day)}
                  style={({ pressed }) => [styles.dayPill, active && styles.dayPillActive, pressed && styles.dayPillPressed]}
                >
                  <Text style={[styles.dayPillText, active && styles.dayPillTextActive]}>Ngày {day}</Text>
                </Pressable>
              )
            })}
          </View>

          <View style={styles.lessonPanel}>
            <Text style={styles.lessonPanelTitle}>Nội dung học - Ngày {activeDay}</Text>
            <View style={styles.lessonColumn}>
              {activeDayLessons.map((lesson) => {
                const allTaskIds = activeDayLessons.map((l) => l.id).join(',')
                const targetPath = `/roadmap/learning/tips/${lesson.id}?level=${targetAim}&roadmap=${allTaskIds}`

                return (
                  <RoadmapLearningLessonCard
                    key={`${lesson.id}-detail`}
                    icon={lesson.icon}
                    title={lesson.title}
                    subtitle={lesson.subtitle}
                    actionLabel={lesson.actionLabel}
                    tone={lesson.tone}
                    isCompleted={lesson.isCompleted}
                    onPress={() => router.push(targetPath)}
                  />
                )
              })}
            </View>
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
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#EBCB9C', backgroundColor: '#FFF8ED',
    ...(Platform.OS === 'web' && { transitionDuration: '140ms', transitionProperty: 'transform, background-color, border-color', transitionTimingFunction: 'ease-out', cursor: 'pointer' }),
  },
  dayPillActive: { backgroundColor: '#FFE9CC', borderColor: '#F4A950' },
  dayPillPressed: { transform: [{ scale: 0.98 }] },
  dayPillText: { fontSize: 13, fontWeight: '600', color: '#6C5531', fontFamily: 'Epilogue, sans-serif' },
  dayPillTextActive: { color: '#5C3B13', fontWeight: '700' },
  lessonPanel: {
    flex: 1, minHeight: 0, backgroundColor: '#FFFDF8', borderRadius: 14, borderWidth: 1, borderColor: '#F9E4BF', padding: 12, gap: 10,
  },
  lessonPanelTitle: { fontSize: 14, fontWeight: '700', color: '#2C2C2C', fontFamily: 'Epilogue, sans-serif' },
  lessonColumn: { gap: 8, flexShrink: 1, minHeight: 0 },
  emptyBox: {
    flex: 1, minHeight: 0, borderRadius: 14, borderWidth: 1, borderColor: '#F1E5CC', backgroundColor: '#FFFDF8', alignItems: 'center', justifyContent: 'center',
  },
  emptyText: { fontSize: 14, color: '#666666', fontFamily: 'Epilogue, sans-serif' },
})
