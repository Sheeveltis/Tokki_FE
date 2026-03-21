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

const SectionScoreCard = ({
  label,
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
              {showPendingMessage ? 'Đang chấm...' : 'Xem chi tiết'}
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
  feedbackData = null,
  feedbackLoading = false,
  feedbackError = null,
  isDurationModalOpen = false,
  onOpenDurationModal,
  onCloseDurationModal,
  onGenerateRoadmap,
  isGeneratingRoadmap = false,
  generateError = null,
}) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [modalStep, setModalStep] = useState(0)
  const [expandedSection, setExpandedSection] = useState(null)

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

  const { userName, examTitle, listening, reading, writing, totalScore } = resultData
  const durationOptions = feedbackData?.durationOptions || []
  const hasFeedback = Boolean(feedbackData)

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
  const toDetail = (sectionKey) =>
    `/roadmap/test/result/detail?userExamId=${encodeURIComponent(userExamId || '')}&section=${encodeURIComponent(
      sectionKey
    )}`

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

          <Text style={styles.title}>Kết quả bài thi</Text>
          {userName && (
            <Text style={styles.subtitle}>
              Thí sinh: {userName}
            </Text>
          )}
          {examTitle && (
            <Text style={styles.examTitle}>{examTitle}</Text>
          )}

          <View style={styles.totalScoreBox}>
            <Text style={styles.totalScoreLabel}>Tổng điểm</Text>
            <Text style={styles.totalScoreValue}>{totalScore ?? 0}</Text>
          </View>

          <View style={styles.sectionsRow}>
            {sectionCards.map((card) => (
              <SectionScoreCard
                key={card.key}
                label={card.label}
                score={card.score}
                maxScore={card.maxScore}
                correctAnswers={card.correctAnswers}
                totalQuestions={card.totalQuestions}
                onViewDetail={() => router.push(toDetail(card.key))}
                isGraded={card.isGraded}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            {isEntrance && (
              <RoadmapTestButton
                title="Tạo lộ trình"
                onPress={() => {
                  setModalStep(0)
                  setSelectedDuration(null)
                  setExpandedSection(null)
                  onOpenDurationModal?.()
                }}
                disabled={!hasFeedback && !feedbackLoading}
                style={[styles.actionButton, styles.actionButtonPrimary]}
              />
            )}
            <RoadmapTestButton
              title="Về trang lộ trình"
              onPress={() => router.push('/roadmap/info')}
              style={[styles.actionButton, styles.actionButtonSecondary]}
            />
          </View>
        </View>
      </ScrollView>

      {isEntrance && (
      <Modal
        visible={isDurationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setModalStep(0)
          setSelectedDuration(null)
          onCloseDurationModal?.()
        }}
      >
        <View style={styles.durationOverlay}>
          <View style={styles.durationModal}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                {modalStep === 0 ? (
                  <InfoCircleOutlined style={styles.modalIcon} />
                ) : modalStep === 1 ? (
                  <OrderedListOutlined style={styles.modalIcon} />
                ) : (
                  <ClockCircleOutlined style={styles.modalIcon} />
                )}
              </View>
              <View style={styles.modalHeaderText}>
                <Text style={styles.durationTitle}>Thông báo</Text>
                <Text style={styles.durationSubtitle}>
                  {modalStep === 0
                    ? 'Phản hồi của hệ thống về bài kiểm tra đầu vào.'
                    : modalStep === 1
                    ? 'Danh sách dạng câu hỏi cần cải thiện.'
                    : 'Chọn thời gian học phù hợp với bạn.'}
                </Text>
              </View>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{modalStep + 1}/3</Text>
              </View>
            </View>

            {feedbackLoading && (
              <Text style={styles.durationLoadingText}>Đang tải thông tin...</Text>
            )}

            {!feedbackLoading && feedbackError && (
              <Text style={styles.durationErrorText}>{feedbackError}</Text>
            )}

            {!feedbackLoading && !feedbackError && hasFeedback && modalStep === 0 && (
              <View style={styles.feedbackCard}>
                <View style={styles.feedbackBadge}>
                  <CheckCircleOutlined style={styles.feedbackBadgeIcon} />
                  <Text style={styles.feedbackBadgeText}>AI Feedback</Text>
                </View>
                <Text style={styles.feedbackText}>
                  {feedbackData?.aiFeedback || 'Chưa có phản hồi từ hệ thống.'}
                </Text>
              </View>
            )}

            {!feedbackLoading && !feedbackError && hasFeedback && modalStep === 1 && (
              <ScrollView style={styles.issueList} contentContainerStyle={styles.issueListContent}>
                <Pressable
                  onPress={() =>
                    setExpandedSection((prev) =>
                      prev === 'listening' ? null : 'listening'
                    )
                  }
                  style={({ pressed, hovered }) => [
                    styles.issueHeaderRow,
                    expandedSection === 'listening' && styles.issueHeaderRowActive,
                    pressed && styles.issueHeaderRowPressed,
                    hovered && styles.issueHeaderRowHover,
                  ]}
                >
                  <OrderedListOutlined style={styles.issueHeaderIcon} />
                  <Text style={styles.issueSectionTitle}>Nghe</Text>
                </Pressable>
                {expandedSection === 'listening' && (
                  feedbackData?.listeningIssues?.length ? (
                    feedbackData.listeningIssues.map((item) => (
                      <View key={item.questionTypeId} style={styles.issueItem}>
                        <Text style={styles.issueCode}>{item.code}</Text>
                        <Text style={styles.issueName}>{item.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.issueEmptyText}>Không có lỗi</Text>
                  )
                )}

                <Pressable
                  onPress={() =>
                    setExpandedSection((prev) =>
                      prev === 'reading' ? null : 'reading'
                    )
                  }
                  style={({ pressed, hovered }) => [
                    styles.issueHeaderRow,
                    expandedSection === 'reading' && styles.issueHeaderRowActive,
                    pressed && styles.issueHeaderRowPressed,
                    hovered && styles.issueHeaderRowHover,
                  ]}
                >
                  <OrderedListOutlined style={styles.issueHeaderIcon} />
                  <Text style={styles.issueSectionTitle}>Đọc</Text>
                </Pressable>
                {expandedSection === 'reading' && (
                  feedbackData?.readingIssues?.length ? (
                    feedbackData.readingIssues.map((item) => (
                      <View key={item.questionTypeId} style={styles.issueItem}>
                        <Text style={styles.issueCode}>{item.code}</Text>
                        <Text style={styles.issueName}>{item.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.issueEmptyText}>Không có lỗi</Text>
                  )
                )}

                <Pressable
                  onPress={() =>
                    setExpandedSection((prev) =>
                      prev === 'writing' ? null : 'writing'
                    )
                  }
                  style={({ pressed, hovered }) => [
                    styles.issueHeaderRow,
                    expandedSection === 'writing' && styles.issueHeaderRowActive,
                    pressed && styles.issueHeaderRowPressed,
                    hovered && styles.issueHeaderRowHover,
                  ]}
                >
                  <OrderedListOutlined style={styles.issueHeaderIcon} />
                  <Text style={styles.issueSectionTitle}>Viết</Text>
                </Pressable>
                {expandedSection === 'writing' && (
                  feedbackData?.writingIssues?.length ? (
                    feedbackData.writingIssues.map((item) => (
                      <View key={item.questionTypeId} style={styles.issueItem}>
                        <Text style={styles.issueCode}>{item.code}</Text>
                        <Text style={styles.issueName}>{item.name}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.issueEmptyText}>Không có lỗi</Text>
                  )
                )}
              </ScrollView>
            )}

            {!feedbackLoading && !feedbackError && hasFeedback && modalStep === 2 && (
              <View style={styles.durationOptions}>
                {durationOptions.map((option) => (
                  <Pressable
                    key={option.days}
                    onPress={() => setSelectedDuration(option.days)}
                    style={({ pressed, hovered }) => [
                      styles.durationOption,
                      selectedDuration === option.days && styles.durationOptionActive,
                      option.available === false && styles.durationOptionDisabled,
                      hovered && option.available !== false && styles.durationOptionHover,
                      pressed && option.available !== false && styles.durationOptionPressed,
                    ]}
                    disabled={option.available === false}
                  >
                    <View style={styles.durationOptionHeader}>
                      <View style={styles.durationOptionTitle}>
                        <ClockCircleOutlined style={styles.durationOptionIcon} />
                        <Text
                          style={[
                            styles.durationOptionDays,
                            selectedDuration === option.days && styles.durationOptionDaysActive,
                          ]}
                        >
                          {option.days} ngày
                        </Text>
                      </View>
                      {option.recommended && (
                        <Text style={styles.durationBadge}>Khuyến nghị</Text>
                      )}
                    </View>
                    <Text style={styles.durationReason}>{option.reason}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {modalStep === 2 && generateError && (
              <Text style={styles.durationErrorText}>{generateError}</Text>
            )}

            <View style={styles.durationActions}>
              {modalStep > 0 ? (
                <Pressable
                  onPress={() => setModalStep((prev) => Math.max(prev - 1, 0))}
                  style={({ pressed, hovered }) => [
                    styles.durationButton,
                    styles.durationButtonSecondary,
                    hovered && styles.durationButtonSecondaryHover,
                    pressed && styles.durationButtonPressed,
                  ]}
                >
                  <Text style={styles.durationButtonSecondaryText}>Quay lại</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    setModalStep(0)
                    setSelectedDuration(null)
                    setExpandedSection(null)
                    onCloseDurationModal?.()
                  }}
                  style={({ pressed, hovered }) => [
                    styles.durationButton,
                    styles.durationButtonSecondary,
                    hovered && styles.durationButtonSecondaryHover,
                    pressed && styles.durationButtonPressed,
                  ]}
                >
                  <Text style={styles.durationButtonSecondaryText}>Để sau</Text>
                </Pressable>
              )}

              {modalStep < 2 ? (
                <Pressable
                  onPress={() => {
                    setModalStep((prev) => Math.min(prev + 1, 2))
                    if (modalStep === 0) {
                      setExpandedSection(null)
                    }
                  }}
                  style={({ pressed, hovered }) => [
                    styles.durationButton,
                    styles.durationButtonPrimary,
                    hovered && styles.durationButtonPrimaryHover,
                    pressed && styles.durationButtonPressed,
                  ]}
                >
                  <Text style={styles.durationButtonPrimaryText}>Tiếp theo</Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={async () => {
                    if (!selectedDuration || isGeneratingRoadmap) return
                    const roadmapResult = await onGenerateRoadmap?.({
                      durationDays: selectedDuration,
                      currentLevel: 0,
                    })
                    if (roadmapResult && !roadmapResult.hasExisting) {
                      onCloseDurationModal?.()
                      router.push('/roadmap/learning')
                    }
                  }}
                  style={({ pressed, hovered }) => [
                    styles.durationButton,
                    styles.durationButtonPrimary,
                    !selectedDuration && styles.durationButtonDisabled,
                    isGeneratingRoadmap && styles.durationButtonDisabled,
                    hovered && selectedDuration && !isGeneratingRoadmap && styles.durationButtonPrimaryHover,
                    pressed && selectedDuration && !isGeneratingRoadmap && styles.durationButtonPressed,
                  ]}
                  disabled={!selectedDuration || isGeneratingRoadmap}
                >
                  <Text style={styles.durationButtonPrimaryText}>
                    {isGeneratingRoadmap ? 'Đang tạo...' : 'Tạo lộ trình'}
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFEFE1',
    minHeight: '100vh',
  },
  scrollContent: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 80,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 0,
  },
  content: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FDF7EC',
    borderRadius: 24,
    padding: 32,
    gap: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  backButton: {
    minWidth: 140,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  examTitle: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  totalScoreBox: {
    backgroundColor: '#FFF2CC',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFC56E',
  },
  totalScoreLabel: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 4,
  },
  totalScoreValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionsRow: {
    gap: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2E7D32',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionDetailText: {
    fontSize: 14,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
  },
  sectionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  detailLink: {
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  detailLinkPressed: {
    opacity: 0.7,
  },
  detailLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textDecorationLine: 'none',
  },
  detailLinkDisabled: {
    opacity: 0.5,
  },
  detailLinkTextDisabled: {
    color: '#8E8E8E',
  },
  pendingText: {
    fontSize: 14,
    color: '#FF9800',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  pendingScoreText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  actionButtonPrimary: {
    backgroundColor: '#FFB74D',
  },
  actionButtonSecondary: {
    backgroundColor: '#FFF4DA',
  },
  durationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  durationModal: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    gap: 18,
    borderWidth: 1,
    borderColor: '#FFE0B3',
    maxHeight: '86vh',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 18px 36px rgba(0,0,0,0.16)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  modalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1D6',
  },
  modalIcon: {
    fontSize: 22,
    color: '#E67E22',
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  stepBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FFF4DA',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  stepBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B86B1E',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationSubtitle: {
    fontSize: 14,
    color: '#6F6F6F',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 20,
  },
  durationLoadingText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationErrorText: {
    fontSize: 14,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationOptions: {
    gap: 12,
  },
  feedbackCard: {
    paddingVertical: 8,
    gap: 12,
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#FFEFD6',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  feedbackBadgeIcon: {
    fontSize: 14,
    color: '#E67E22',
  },
  feedbackBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B86B1E',
    fontFamily: 'Epilogue, sans-serif',
  },
  feedbackText: {
    fontSize: 18,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 30,
    fontWeight: 500,
  },
  issueList: {
    minHeight: '40vh',
    maxHeight: '40vh',
  },
  issueListContent: {
    gap: 12,
    paddingBottom: 8,
  },
  issueSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8E6B2B',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  issueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  issueHeaderRowActive: {
    backgroundColor: '#FFF4DA',
    borderWidth: 1,
    borderColor: '#FFE0B3',
  },
  issueHeaderRowHover: {
    backgroundColor: '#FFF9F0',
  },
  issueHeaderRowPressed: {
    opacity: 0.8,
  },
  issueHeaderIcon: {
    fontSize: 16,
    color: '#E67E22',
  },
  issueItem: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#FFE6C8',
    gap: 4,
  },
  issueCode: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E65100',
    fontFamily: 'Epilogue, sans-serif',
  },
  issueName: {
    fontSize: 13,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  issueEmptyText: {
    fontSize: 13,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationOption: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0B3',
    backgroundColor: '#FFF9F2',
    gap: 8,
  },
  durationOptionPressed: {
    opacity: 0.9,
  },
  durationOptionHover: {
    borderColor: '#FFC56E',
    backgroundColor: '#FFF3E0',
  },
  durationOptionActive: {
    borderColor: '#FF9800',
    backgroundColor: '#FFF1D6',
  },
  durationOptionDisabled: {
    opacity: 0.6,
  },
  durationOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  durationOptionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationOptionIcon: {
    fontSize: 16,
    color: '#E67E22',
  },
  durationOptionDays: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationOptionDaysActive: {
    color: '#E65100',
  },
  durationBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  durationReason: {
    fontSize: 13,
    color: '#5F5F5F',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  durationActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  durationButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  durationButtonPrimary: {
    backgroundColor: '#FFB74D',
  },
  durationButtonPrimaryHover: {
    backgroundColor: '#FFA726',
  },
  durationButtonSecondary: {
    backgroundColor: '#FFF4DA',
  },
  durationButtonSecondaryHover: {
    backgroundColor: '#FFE7C2',
  },
  durationButtonDisabled: {
    opacity: 0.6,
  },
  durationButtonPressed: {
    opacity: 0.85,
  },
  durationButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6F6F6F',
    fontFamily: 'Epilogue, sans-serif',
  },
})
