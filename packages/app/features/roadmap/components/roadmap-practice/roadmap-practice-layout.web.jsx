import React, { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapLearningLessonCard } from '../roadmap-learning/roadmap-learning-lesson-card'

import ListeningIcon from '../../../../../assets/icon/icon-roadmap/headphones-round-sound-svgrepo-com.svg'
import ReadingIcon from '../../../../../assets/icon/icon-roadmap/notebook-1-svgrepo-com.svg'

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
    <View style={styles.container}>
      <Navbar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation */}
          <View style={styles.topNavigation}>
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Text style={styles.backButtonArrow}>←</Text>
              <Text style={styles.backButtonText}>Quay lại</Text>
            </Pressable>
            
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Học tập</Text>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Luyện tập</Text>
            </View>
          </View>

          {/* Header Section */}
          <View style={styles.heroSection}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>BỘ ĐỀ SÁT THẬT</Text>
            </View>
            <Text style={styles.mainTitle}>{meta.label}</Text>
            <Text style={styles.subtitle}>{meta.description}</Text>
          </View>

          {/* Main Content Card */}
          <View style={styles.contentCard}>
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>Danh sách đề ôn luyện</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{meta.sets.length} đề</Text>
              </View>
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
                    console.log('Open practice set', set.id)
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  mainWrapper: {
    width: '90%',
    maxWidth: 900,
    marginTop: 32,
    gap: 32,
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }),
  },
  backButtonPressed: {
    backgroundColor: '#F9F9F9',
    transform: [{ scale: 0.98 }],
  },
  backButtonArrow: {
    fontSize: 18,
    color: '#1C1C1C',
    fontWeight: '600',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumbDivider: {
    fontSize: 13,
    color: '#DDD',
  },
  breadcrumbActive: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  heroSection: {
    gap: 12,
    paddingHorizontal: 4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2CC',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C28A04',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    lineHeight: 24,
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: '80%',
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 24,
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  countBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
  },
  listWrapper: {
    gap: 16,
  },
})

