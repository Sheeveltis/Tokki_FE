import { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapLearningDayItem } from './roadmap-learning-day-item'
import { RoadmapLearningLessonCard } from './roadmap-learning-lesson-card'

import ListeningIcon from '../../../../../assets/icon/icon-mainflow/headphone.svg'
import ReadingIcon from '../../../../../assets/icon/icon-mainflow/read.svg'
import WritingIcon from '../../../../../assets/icon/icon-mainflow/write_image.jpg'

const TASK_TYPE_CONFIG = {
  LearnTheory: {
    actionLabel: 'Học lý thuyết',
    tone: 'primary',
  },
  VirtualQuiz: {
    actionLabel: 'Quiz',
    tone: 'secondary',
  },
  WeeklyExam: {
    actionLabel: 'Bài thi cuối tuần',
    tone: 'secondary',
  },
  0: {
    actionLabel: 'Học lý thuyết',
    tone: 'primary',
  },
  1: {
    actionLabel: 'Quiz',
    tone: 'secondary',
  },
  2: {
    actionLabel: 'Bài thi cuối tuần',
    tone: 'secondary',
  },
}

const normalizeTaskType = (taskType) => {
  if (taskType === 0 || taskType === '0') return 0
  if (taskType === 1 || taskType === '1') return 1
  if (taskType === 2 || taskType === '2') return 2
  return taskType
}

const getSkillFromTitle = (title = '') => {
  const normalized = title.toLowerCase()
  if (normalized.includes('nghe')) return 'listening'
  if (normalized.includes('đọc')) return 'reading'
  if (normalized.includes('doc')) return 'reading'
  if (normalized.includes('viết')) return 'writing'
  if (normalized.includes('viet')) return 'writing'
  return 'listening'
}

const buildLessonsFromTasks = (tasks = [], hasWriting) =>
  tasks
    .map((task) => {
      const normalizedType = normalizeTaskType(task.taskType)
      const config = TASK_TYPE_CONFIG[normalizedType] || TASK_TYPE_CONFIG.VirtualQuiz
      const skillKey = getSkillFromTitle(task.title)
      if (!hasWriting && skillKey === 'writing') {
        return null
      }
      const skillLabel =
        skillKey === 'listening' ? 'Nghe' : skillKey === 'reading' ? 'Đọc' : 'Viết'
      const skillIcon =
        skillKey === 'listening'
          ? ListeningIcon
          : skillKey === 'reading'
          ? ReadingIcon
          : WritingIcon
      return {
        id: task.taskId,
        icon: skillIcon,
        title: task.title,
        subtitle: `${skillLabel} • ${config.actionLabel}`,
        actionLabel: config.actionLabel,
        tone: config.tone,
        taskType: normalizedType,
        examId: task.examId,
        questionTypeId: task.questionTypeId,
      }
    })
    .filter(Boolean)

export function RoadmapLearningDayList({ hasWriting, targetAim = 1, weeks = [] }) {
  const [activeDay, setActiveDay] = useState(1)
  const router = useRouter()

  const allTasks = useMemo(() => {
    return weeks.reduce((acc, week) => {
      const tasks = Array.isArray(week?.tasks) ? week.tasks : []
      return acc.concat(tasks)
    }, [])
  }, [weeks])

  const lessonsByDay = useMemo(() => {
    if (!allTasks.length) return {}
    return allTasks.reduce((acc, task) => {
      const dayIndex = task.dayIndex || 1
      if (!acc[dayIndex]) {
        acc[dayIndex] = []
      }
      acc[dayIndex].push(task)
      return acc
    }, {})
  }, [allTasks])

  const dayKeys = useMemo(() => {
    const keys = Object.keys(lessonsByDay)
    if (!keys.length) return []
    return keys.map(Number).sort((a, b) => a - b)
  }, [lessonsByDay])

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {dayKeys.length === 0 && (
          <Text style={styles.emptyText}>Chưa có nội dung cho tuần này.</Text>
        )}
        {dayKeys.map((day) => {
          const isActiveDay = activeDay === day
          const dayTasks = lessonsByDay[day] || []
          const lessons = buildLessonsFromTasks(dayTasks, hasWriting)
          const headerLesson = lessons[0]
          const extraLessons = lessons.slice(1)

          return (
            <View key={day} style={styles.dayWrapper}>
              <RoadmapLearningDayItem
                dayIndex={day}
                isActive={isActiveDay}
                onPress={() => setActiveDay(day)}
                header={
                  headerLesson ? (
                    <RoadmapLearningLessonCard
                      icon={headerLesson.icon}
                      title={`Ngày ${day}: ${headerLesson.title}`}
                      subtitle={headerLesson.subtitle}
                      actionLabel={headerLesson.actionLabel}
                      tone={headerLesson.tone}
                      variant="header"
                    />
                  ) : (
                    <Text style={styles.emptyText}>Chưa có nội dung cho ngày này.</Text>
                  )
                }
              >
                {extraLessons.length > 0 && (
                  <View style={styles.lessonColumn}>
                    {extraLessons.map((lesson) => {
                      const isPractice = lesson.taskType === 1
                      const isReview = lesson.taskType === 2

                      let targetPath
                      if (isPractice) {
                        targetPath = `/roadmap/learning/practice/${lesson.id}`
                      } else if (isReview) {
                        targetPath = `/roadmap/test?level=${targetAim}`
                      } else {
                        targetPath = `/roadmap/learning/tips/${lesson.id}`
                      }

                      return (
                        <RoadmapLearningLessonCard
                          key={lesson.id}
                          icon={lesson.icon}
                          title={lesson.title}
                          subtitle={lesson.subtitle}
                          actionLabel={lesson.actionLabel}
                          tone={lesson.tone}
                          onPress={() => router.push(targetPath)}
                        />
                      )
                    })}
                  </View>
                )}
              </RoadmapLearningDayItem>
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
    gap: 16,
  },
  dayWrapper: {
    paddingHorizontal: 4,
  },
  lessonColumn: {
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
})
