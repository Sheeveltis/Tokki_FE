import React, { useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { RoadmapLearningDayItem } from './roadmap-learning-day-item'
import { RoadmapLearningLessonCard } from './roadmap-learning-lesson-card'

import ListeningIcon from '../../../../../assets/icon/icon-roadmap/headphones-round-sound-svgrepo-com.svg'
import ReadingIcon from '../../../../../assets/icon/icon-roadmap/notebook-1-svgrepo-com.svg'
import GuideIcon from '../../../../../assets/icon/icon-roadmap/signpost-2-svgrepo-com.svg'
import PracticeIcon from '../../../../../assets/icon/icon-roadmap/lightbulb-minimalistic-svgrepo-com.svg'
import ReviewIcon from '../../../../../assets/icon/icon-roadmap/cup.svg'

// Simple mock structure for roadmap by skill + day.
// Later this can be replaced by real API data.
const createMockRoadmap = () => {
  const days = Array.from({ length: 7 }, (_, i) => i + 1)

  return days.map((day) => ({
    day,
    listening: [
      {
        id: 'listen-main',
        icon: ListeningIcon,
        title: `Câu ${1 + (day - 1) * 4} - ${4 * day} | TOPIK I`,
        subtitle: 'Hoàn thành hội thoại',
        actionLabel: 'Nghe hiểu',
        tone: 'primary',
      },
      {
        id: 'listen-guide',
        icon: GuideIcon,
        title: 'Hướng dẫn',
        subtitle: 'Tips chọn đáp án',
        actionLabel: 'Tips',
        tone: 'secondary',
      },
      {
        id: 'listen-practice',
        icon: PracticeIcon,
        title: 'Luyện tập',
        subtitle: 'Luyện nghe, phân tích chọn đáp án',
        actionLabel: 'Luyện tập',
        tone: 'secondary',
      },
      {
        id: 'listen-review',
        icon: ReviewIcon,
        title: 'Kiểm tra - Đánh giá',
        subtitle: 'Kiểm tra dạng câu 1 - 4',
        actionLabel: 'Đánh giá',
        tone: 'secondary',
      },
    ],
    reading: [
      {
        id: 'read-main',
        icon: ReadingIcon,
        title: 'Đọc hiểu cơ bản',
        subtitle: 'Luyện đọc đoạn hội thoại ngắn',
        actionLabel: 'Đọc hiểu',
        tone: 'primary',
      },
      {
        id: 'read-guide',
        icon: GuideIcon,
        title: 'Hướng dẫn',
        subtitle: 'Tips chọn đáp án khi đọc hiểu',
        actionLabel: 'Tips',
        tone: 'secondary',
      },
      {
        id: 'read-practice',
        icon: PracticeIcon,
        title: 'Luyện tập',
        subtitle: 'Luyện đọc, phân tích chọn đáp án',
        actionLabel: 'Luyện tập',
        tone: 'secondary',
      },
      {
        id: 'read-review',
        icon: ReviewIcon,
        title: 'Kiểm tra - Đánh giá',
        subtitle: 'Kiểm tra dạng bài đọc trong ngày',
        actionLabel: 'Đánh giá',
        tone: 'secondary',
      },
    ],
    writing: [
      {
        id: 'write-main',
        icon: '✍️',
        title: 'Viết câu đơn giản',
        subtitle: 'Luyện viết 2-3 câu theo chủ đề',
        actionLabel: 'Viết',
        tone: 'primary',
      },
    ],
  }))
}

const MOCK_ROADMAP = createMockRoadmap()

export function RoadmapLearningDayList({ activeTab, hasWriting, level = 1 }) {
  const [activeDay, setActiveDay] = useState(1)
  const router = useRouter()

  const normalizedTab = activeTab === 'writing' && !hasWriting ? 'listening' : activeTab

  return (
    <View style={styles.wrapper}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {MOCK_ROADMAP.map((dayData) => {
          const { day } = dayData
          const isActiveDay = activeDay === day
          const lessonsByTab = {
            listening: dayData.listening,
            reading: dayData.reading,
            writing: hasWriting ? dayData.writing : [],
          }

          const lessons = lessonsByTab[normalizedTab] || []
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
                      title={headerLesson.title}
                      subtitle={headerLesson.subtitle}
                      actionLabel={headerLesson.actionLabel}
                      tone={headerLesson.tone}
                      variant="header"
                    />
                  ) : (
                    <Text style={styles.emptyText}>Chưa có nội dung cho kỹ năng này.</Text>
                  )
                }
              >
                {extraLessons.length > 0 && (
                  <View style={styles.lessonColumn}>
                    {extraLessons.map((lesson) => {
                      const isPractice = lesson.id.includes('practice')
                      const isReview = lesson.id.includes('review')

                      let targetPath
                      if (isPractice) {
                        targetPath = `/roadmap/learning/practice/${lesson.id}`
                      } else if (isReview) {
                        // Đánh giá: cho làm một đề kiểm tra theo level hiện tại
                        targetPath = `/roadmap/test?level=${level}`
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

