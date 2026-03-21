import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'
import { HtmlViewer } from '../../../blog/components/blog-detail/html-viewer'

const TASK_TYPE_LABEL = {
  LearnTheory: 'Lý thuyết',
  VirtualQuiz: 'Luyện tập',
  WeeklyExam: 'Thi thử tuần',
}

export function RoadmapTipsLayout({ tipId, taskDetail, isLoading = false, error = null, onRetry }) {
  const router = useRouter()

  const title = taskDetail?.title || 'Nội dung bài học'
  const taskType = taskDetail?.taskType
  const skill = taskDetail?.skill
  const typeLabel = TASK_TYPE_LABEL[taskType] || taskType || 'Bài học'
  const contentHtml = String(taskDetail?.content || '')

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.backButtonContainer}>
          <NavigationPill
            label="Quay lại"
            to={undefined}
            onPress={() => router.back()}
            icon={ArrowIcon}
            textStyle={{ fontWeight: '700' }}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
          />
        </View>

        {isLoading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Đang tải nội dung bài học...</Text>
          </View>
        ) : error || !taskDetail ? (
          <View style={styles.centerContent}>
            <Text style={styles.errorText}>{error || 'Không thể tải nội dung bài học.'}</Text>
            <RoadmapTestButton title="Tải lại" onPress={onRetry} style={styles.retryButton} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.kicker}>Roadmap Learning</Text>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>
                {skill || 'Kỹ năng'} • {typeLabel}
              </Text>
            </View>

            <View style={styles.article}>
              <HtmlViewer html={contentHtml} />
            </View>
          </ScrollView>
        )}
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
    backgroundColor: '#FDF7EC',
    borderRadius: 16,
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  backButtonContainer: {
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  scrollContent: {
    gap: 20,
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
    fontSize: 14,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 21,
  },
  article: {
    backgroundColor: '#FFFDF8',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 28,
  },

  centerContent: {
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  retryButton: {
    minWidth: 140,
  },
})
