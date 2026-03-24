import { useState } from 'react'
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Modal } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from './roadmap-test-button'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavigationPill } from '../../../../../components/navigation-pill'
import {
  InfoCircleOutlined,
  OrderedListOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { Modal as RNModal } from 'react-native'
import { RoadmapTestResultDetailView } from './roadmap-test-result-detail-view'
import { apiClient } from '../../../../provider/api/client'

const SectionScoreCard = ({
  label,
  sectionKey,
  score,
  maxScore,
  correctAnswers,
  totalQuestions,
  onViewDetail,
  isGraded = true,
}) => {
  const isWriting = label === 'Viết'
  const showPendingMessage = isWriting && !isGraded

  return (
    <View style={styles.sectionCard}>
      {/* Row 1: label (left) + correct (right) */}
      <View style={styles.sectionTopRow}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {showPendingMessage ? (
          <Text style={styles.pendingText}>Đang chấm điểm...</Text>
        ) : (
          <Text style={styles.sectionDetailText}>
            {correctAnswers} / {totalQuestions} câu đúng
          </Text>
        )}
      </View>

      {/* Row 2: score (left) + view detail (right) */}
      <View style={styles.sectionBottomRow}>
        {showPendingMessage ? (
          <Text style={styles.pendingScoreText}>Chưa có điểm</Text>
        ) : (
          <Text style={styles.sectionScoreText}>
            {score} / {maxScore} điểm
          </Text>
        )}
        {!!onViewDetail && (
          <Pressable
            onPress={onViewDetail}
            disabled={showPendingMessage}
            style={({ pressed }) => [
              styles.detailLink,
              pressed && styles.detailLinkPressed,
              showPendingMessage && styles.detailLinkDisabled,
            ]}
            hitSlop={6}
          >
            <Text
              style={[
                styles.detailLinkText,
                showPendingMessage && styles.detailLinkTextDisabled,
              ]}
            >
              {showPendingMessage ? 'Đang chấm...' : 'Chi tiết'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

export function RoadmapTestResultLayout({
  userExamId,
  resultData,
  isLoading,
  error,
  isGraded = false,
  isEntrance = false,
  onNavigateToGenerate,
}) {
  const router = useRouter()

  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [detailSection, setDetailSection] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState(null)

  const fetchDetail = async (section) => {
    if (!userExamId || !section) return
    setDetailModalVisible(true)
    setDetailSection(section)
    setDetailLoading(true)
    setDetailError(null)
    setDetailData(null)
    try {
      const url = `/UserExam/${encodeURIComponent(userExamId)}/result/${encodeURIComponent(section)}`
      const response = await apiClient.get(url)
      setDetailData(response?.data?.data)
    } catch (err) {
      console.error('Failed to fetch detail:', err)
      setDetailError('Không thể tải chi tiết phần này.')
    } finally {
      setDetailLoading(false)
    }
  }

  if (isLoading) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Đang tải kết quả...</Text>
        </View>
      </View>
    )
  }

  if (error || !resultData) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error || 'Không thể tải kết quả bài thi.'}</Text>
          <RoadmapTestButton
            title="Quay lại"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    )
  }

  const { userName, examTitle, listening, reading, writing, totalScore } = resultData || {}

  const sectionCards = [
    listening
      ? {
        key: 'listening',
        label: 'Nghe',
        score: listening.score,
        maxScore: listening.maxScore,
        correctAnswers: listening.correctAnswers,
        totalQuestions: listening.totalQuestions,
        isGraded: true,
      }
      : null,
    reading
      ? {
        key: 'reading',
        label: 'Đọc',
        score: reading.score,
        maxScore: reading.maxScore,
        correctAnswers: reading.correctAnswers,
        totalQuestions: reading.totalQuestions,
        isGraded: true,
      }
      : null,
    writing
      ? {
        key: 'writing',
        label: 'Viết',
        score: writing.score,
        maxScore: writing.maxScore,
        correctAnswers: writing.correctAnswers,
        totalQuestions: writing.totalQuestions,
        isGraded,
      }
      : null,
  ].filter(Boolean)

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              onPress={() => router.push('/roadmap/info')}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Kết quả bài thi</Text>
            {examTitle && (
              <Text style={styles.examTitle}>{examTitle}</Text>
            )}
          </View>

          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreLabel}>Tổng điểm đạt được</Text>
            <Text style={styles.totalScoreValue}>{totalScore ?? 0}</Text>
          </View>

          <View style={styles.sectionsRow}>
            {sectionCards.map((card) => (
              <SectionScoreCard
                key={card.key}
                sectionKey={card.key}
                label={card.label}
                score={card.score}
                maxScore={card.maxScore}
                correctAnswers={card.correctAnswers}
                totalQuestions={card.totalQuestions}
                onViewDetail={() => fetchDetail(card.key)}
                isGraded={card.isGraded}
              />
            ))}
          </View>

          <View style={styles.actionsColumn}>
            {isEntrance && (
              <RoadmapTestButton
                title="Tạo lộ trình học tập"
                onPress={onNavigateToGenerate}
                style={[styles.actionButton, styles.actionButtonPrimary]}
                hoverStyle={styles.actionButtonPrimaryHover}
                textStyle={styles.actionButtonPrimaryText}
              />
            )}
            <RoadmapTestButton
              title="Quay lại trang lộ trình"
              onPress={() => router.push('/roadmap/info')}
              style={[styles.actionButton, styles.actionButtonSecondary]}
              hoverStyle={styles.actionButtonSecondaryHover}
              textStyle={styles.actionButtonSecondaryText}
            />
          </View>
        </View>
      </ScrollView>

      <RNModal
        visible={detailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBody}>
            <RoadmapTestResultDetailView
              section={detailSection}
              detailData={detailData}
              isLoading={detailLoading}
              error={detailError}
              onClose={() => setDetailModalVisible(false)}
            />
          </View>
        </View>
      </RNModal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    minHeight: '100vh',
  },
  scrollContent: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 100,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  content: {
    width: '100%',
    maxWidth: 800,
    gap: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    fontWeight: '600',
  },
  backButton: {
    minWidth: 160,
  },
  headerSection: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  examTitle: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  totalScoreBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
    }),
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#999',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  totalScoreValue: {
    fontSize: 72,
    fontWeight: '900',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -2,
  },
  sectionsRow: {
    flexDirection: 'row',
    gap: 20,
    flexWrap: 'wrap',
  },
  sectionCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
      transition: 'transform 0.2s ease',
      ':hover': {
        transform: 'translateY(-4px)',
      }
    }),
  },
  sectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionDetailText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sectionScoreText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  detailLink: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  detailLinkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  pendingText: {
    fontSize: 12,
    color: '#F1BE4B',
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pendingScoreText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#CCC',
  },
  actionsColumn: {
    flexDirection: 'column',
    gap: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  actionButton: {
    width: '100%',
    maxWidth: 320,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 25px rgba(241, 190, 75, 0.4)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    }),
  },
  actionButtonPrimaryHover: {
    ...(Platform.OS === 'web' && {
      transform: 'translateY(-4px)',
      boxShadow: '0 15px 35px rgba(241, 190, 75, 0.6)',
      backgroundColor: '#F7C965',
    }),
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
    }),
  },
  actionButtonSecondaryHover: {
    ...(Platform.OS === 'web' && {
      backgroundColor: '#F9FAFB',
      borderColor: '#F1BE4B',
    }),
  },
  actionButtonPrimaryText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalBody: {
    width: '100%',
    maxWidth: 1000,
    height: '85vh',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    }),
  },
})
