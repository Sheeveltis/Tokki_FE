import React, { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ListeningIcon from '../../../../../assets/icon/icon-roadmap/headphones-round-sound-svgrepo-com.svg'
import ReadingIcon from '../../../../../assets/icon/icon-roadmap/notebook-1-svgrepo-com.svg'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { RoadmapLearningLessonCard } from '../roadmap-learning/roadmap-learning-lesson-card'

const PRACTICE_SETS = {
  'listen-practice': [
    { id: 't2-lis-83', title: 'Kì 83 - TOPIK II', subtitle: 'Luyện nghe đề thi thật', actionLabel: 'Làm đề' },
    { id: 't2-lis-84', title: 'Kì 84 - TOPIK II', subtitle: 'Luyện nghe đề thi thật', actionLabel: 'Làm đề' },
    { id: 't2-lis-mock-1', title: 'Đề mô phỏng 1', subtitle: 'Ôn tập tổng hợp dạng nghe', actionLabel: 'Làm đề' },
  ],
  'read-practice': [
    { id: 't2-read-83', title: 'Kì 83 - TOPIK II', subtitle: 'Luyện đọc đề thi thật', actionLabel: 'Làm đề' },
    { id: 't2-read-84', title: 'Kì 84 - TOPIK II', subtitle: 'Luyện đọc đề thi thật', actionLabel: 'Làm đề' },
    { id: 't2-read-mock-1', title: 'Đề mô phỏng 1', subtitle: 'Ôn tập tổng hợp dạng đọc', actionLabel: 'Làm đề' },
  ],
}

const getPracticeMeta = (practiceId) => {
  if (practiceId === 'read-practice') {
    return {
      label: 'Luyện tập Đọc hiểu',
      description: 'Chọn đề TOPIK để luyện đọc hiểu theo đúng cấu trúc đề thi.',
      icon: ReadingIcon,
      sets: PRACTICE_SETS['read-practice'],
    }
  }

  // Mặc định: luyện nghe
  return {
    label: 'Luyện tập Nghe hiểu',
    description: 'Chọn đề TOPIK để luyện nghe hội thoại, thông báo và đoạn văn.',
    icon: ListeningIcon,
    sets: PRACTICE_SETS['listen-practice'],
  }
}

export function RoadmapPracticeLayout({ practiceId }) {
  const router = useRouter()
  const meta = useMemo(() => getPracticeMeta(practiceId), [practiceId])

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.backButtonContainer}>
          <NavigationPill
            label="Quay lại"
            to={undefined}
            icon={ArrowIcon}
            onPress={() => router.back()}
            textStyle={{ fontWeight: '700' }}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
          />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.kicker}>Luyện tập</Text>
            <Text style={styles.title}>{meta.label}</Text>
            <Text style={styles.subtitle}>{meta.description}</Text>
          </View>

          <View style={styles.listWrapper}>
            {meta.sets.map((set) => (
              <RoadmapLearningLessonCard
                key={set.id}
                icon={meta.icon}
                title={set.title}
                subtitle={set.subtitle}
                actionLabel={set.actionLabel}
                tone="secondary"
                onPress={() => {
                  // TODO: điều hướng tới trang làm đề cụ thể
                  console.log('Open practice set', set.id)
                }}
              />
            ))}
          </View>
        </ScrollView>
      </View>
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
    backgroundColor: '#F5F0DD',
    borderRadius: 16,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  scrollContent: {
    gap: 24,
    paddingBottom: 16,
  },
  header: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C28A04',
    textTransform: 'uppercase',
    fontFamily: 'Epilogue, sans-serif',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    lineHeight: 22,
    fontFamily: 'Epilogue, sans-serif',
  },
  listWrapper: {
    marginTop: 4,
    gap: 12,
  },
})

