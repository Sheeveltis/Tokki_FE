import { useState, useEffect } from 'react'
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
import { KOREA_TRIVIA } from '../../constants/waiting-trivia'

const SectionScoreCard = ({
  label,
  sectionKey,
  score,
  maxScore,
  correctAnswers,
  totalQuestions,
  onViewDetail,
  isGraded = true,
  gradingProgress = null,
}) => {
  const isWriting = label === 'Viết'
  const isGradingWriting = isWriting && !isGraded && gradingProgress
  const showPendingMessage = isWriting && !isGraded

  return (
    <View style={styles.sectionCard}>
      {/* Row 1: label (left) + correct (right) */}
      <View style={styles.sectionTopRow}>
        <View>
          <Text style={styles.sectionLabel}>{label}</Text>
          {isGradingWriting && (
            <Text style={styles.gradingProgressPercent}>
              {Math.round(gradingProgress.progressPercentage)}% hoàn thành
            </Text>
          )}
        </View>
        {showPendingMessage ? (
          <Text style={styles.pendingText}>
            {isGradingWriting ? 'Đang chấm...' : 'Đang chấm điểm...'}
          </Text>
        ) : (
          <Text style={styles.sectionDetailText}>
            {correctAnswers} / {totalQuestions} câu đúng
          </Text>
        )}
      </View>

      {/* Row 2: score (left) + view detail (right) */}
      <View style={styles.sectionBottomRow}>
        {showPendingMessage ? (
          <View style={styles.pendingScoreContainer}>
            <Text style={styles.pendingScoreText}>Chưa có điểm</Text>
            {isGradingWriting && (
              <View style={styles.progressBarContainer}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${gradingProgress.progressPercentage}%` }
                  ]} 
                />
              </View>
            )}
          </View>
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

const WaitingModal = ({
  visible,
  gradingProgress,
  trivia,
}) => {
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.waitingModalBody}>
          <View style={styles.waitingHeader}>
            <ClockCircleOutlined style={{ color: '#F1BE4B', fontSize: 24 }} />
            <Text style={styles.waitingTitle}>Đang chấm điểm</Text>
            <Text style={styles.waitingSubtitle}>
              Vui lòng đợi trong giây lát, AI đang phân tích bài làm của bạn...
            </Text>
          </View>

          <View style={styles.waitingProgressSection}>
            <View style={styles.mainProgressContainerLarge}>
              <View 
                style={[
                  styles.mainProgressFill, 
                  { width: `${gradingProgress?.progressPercentage || 0}%` }
                ]} 
              />
            </View>
            <View style={styles.progressDetailRow}>
              <Text style={styles.progressStatusText}>
                {gradingProgress?.message || 'Đang chuẩn bị...'}
              </Text>
              <Text style={styles.progressPercentageTextLarge}>
                {Math.round(gradingProgress?.progressPercentage || 0)}%
              </Text>
            </View>
          </View>

          {trivia && (
            <View style={styles.waitingTriviaBox}>
              <View style={styles.triviaHeader}>
                <View style={styles.triviaBadge}>
                  <Text style={styles.triviaBadgeText}>BẠN CÓ BIẾT?</Text>
                </View>
                <Text style={styles.triviaTopicText}>{trivia.topic}</Text>
              </View>
              <Text style={styles.triviaContentTextLarge}>{trivia.content}</Text>
            </View>
          )}

          <View style={styles.waitingFooter}>
            <Text style={styles.waitingFooterText}>
              Kết quả sẽ tự động hiển thị sau khi hoàn thành.
            </Text>
          </View>
        </View>
      </View>
    </RNModal>
  )
}

export function RoadmapTestResultLayout({
  userExamId,
  resultData,
  isLoading,
  error,
  isGraded = false,
  gradingProgress = null,
  isEntrance = false,
  onNavigateToGenerate,
  onRetake,
}) {
  const router = useRouter()

  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0)

  useEffect(() => {
    if (isGraded) return

    // Pick a random starting index
    setCurrentTriviaIndex(Math.floor(Math.random() * KOREA_TRIVIA.length))

    const interval = setInterval(() => {
      setCurrentTriviaIndex((prev) => (prev + 1) % KOREA_TRIVIA.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isGraded])

  const trivia = KOREA_TRIVIA[currentTriviaIndex]

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
                gradingProgress={gradingProgress}
              />
            ))}
          </View>

          <View style={styles.actionsColumn}>
            {isEntrance && (
              <RoadmapTestButton
                title={isGraded ? "Tạo lộ trình học tập" : "Đang chờ chấm điểm..."}
                onPress={onNavigateToGenerate}
                disabled={!isGraded}
                style={[
                  styles.actionButton,
                  styles.actionButtonPrimary,
                  !isGraded && styles.actionButtonDisabled
                ]}
                hoverStyle={!isGraded ? null : styles.actionButtonPrimaryHover}
                textStyle={styles.actionButtonPrimaryText}
              />
            )}
            <View style={styles.secondaryActionsRow}>
              <RoadmapTestButton
                title="Làm kiểm tra lại"
                onPress={onRetake}
                style={[styles.actionButtonMinor, styles.actionButtonSecondary]}
                hoverStyle={styles.actionButtonSecondaryHover}
                textStyle={styles.actionButtonSecondaryText}
              />
              <RoadmapTestButton
                title="Quay lại trang lộ trình"
                onPress={() => router.push('/roadmap/info')}
                style={[styles.actionButtonMinor, styles.actionButtonSecondary]}
                hoverStyle={styles.actionButtonSecondaryHover}
                textStyle={styles.actionButtonSecondaryText}
              />
            </View>
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

      <WaitingModal
        visible={!isGraded}
        gradingProgress={gradingProgress}
        trivia={trivia}
      />
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
    maxWidth: 1200,
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
  waitingNoticeContainer: {
    gap: 16,
    alignSelf: 'center',
    maxWidth: 600,
    width: '100%',
    marginTop: 8,
  },
  waitingModalBody: {
    width: '100%',
    maxWidth: 550,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    padding: 40,
    alignItems: 'center',
    gap: 32,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
    }),
  },
  waitingHeader: {
    alignItems: 'center',
    gap: 12,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  waitingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  waitingProgressSection: {
    width: '100%',
    gap: 12,
  },
  mainProgressContainerLarge: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStatusText: {
    fontSize: 14,
    color: '#F1BE4B',
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressPercentageTextLarge: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  waitingTriviaBox: {
    width: '100%',
    backgroundColor: '#FAF9F6',
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  triviaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  triviaBadge: {
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  triviaBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  triviaTopicText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
  },
  triviaContentTextLarge: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  waitingFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
    alignItems: 'center',
  },
  waitingFooterText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    fontFamily: 'Epilogue, sans-serif',
  },
  waitingNoticeText: {
    fontSize: 14,
    color: '#856404',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '700',
    flex: 1,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainProgressContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(241, 190, 75, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  mainProgressFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 4,
  },
  progressPercentText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1BE4B',
    fontFamily: 'Epilogue, sans-serif',
    width: 40,
  },
  gradingProgressPercent: {
    fontSize: 12,
    color: '#F1BE4B',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 2,
  },
  pendingScoreContainer: {
    flex: 1,
    gap: 8,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 150,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 3,
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
    gap: 16,
    alignItems: 'center',
    marginTop: 40,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 600,
  },
  actionButton: {
    width: '100%',
    maxWidth: 600,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonMinor: {
    flex: 1,
    maxWidth: 300,
    paddingVertical: 16,
    borderRadius: 16,
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
    backgroundColor: '#e0dfddff',
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
    color: '#555',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionButtonDisabled: {
    opacity: 0.6,
    backgroundColor: '#E5E7EB',
    ...(Platform.OS === 'web' && {
      boxShadow: 'none',
      cursor: 'not-allowed',
    }),
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
