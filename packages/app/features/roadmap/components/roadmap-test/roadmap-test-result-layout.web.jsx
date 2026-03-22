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

          <View style={styles.headerSection}>
            <Text style={styles.title}>Kết quả bài thi</Text>
            {/* {userName && (
              <Text style={styles.subtitle}>
                {userName}
              </Text>
            )} */}
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
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    maxWidth: 240,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionButtonPrimary: {
    backgroundColor: '#F1BE4B',
  },
  actionButtonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  durationOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(10px)',
    }),
  },
  durationModal: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 40,
    gap: 32,
    maxHeight: '90vh',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 40px 100px rgba(0,0,0,0.2)',
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFBE6',
  },
  modalIcon: {
    fontSize: 28,
    color: '#F1BE4B',
  },
  modalHeaderText: {
    flex: 1,
    gap: 4,
  },
  stepBadge: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFBE6',
    borderRadius: 12,
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#F1BE4B',
  },
  durationTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  durationSubtitle: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 22,
    fontWeight: '500',
  },
  feedbackCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 32,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  feedbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBE6',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  feedbackBadgeIcon: {
    fontSize: 16,
    color: '#F1BE4B',
  },
  feedbackBadgeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F1BE4B',
  },
  feedbackText: {
    fontSize: 18,
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 32,
    fontWeight: '500',
  },
  issueList: {
    maxHeight: '45vh',
  },
  issueListContent: {
    gap: 12,
  },
  issueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  issueHeaderRowActive: {
    backgroundColor: '#FFFBE6',
    borderColor: '#F1BE4B',
  },
  issueSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
  },
  issueHeaderIcon: {
    fontSize: 18,
    color: '#F1BE4B',
  },
  issueItem: {
    padding: 16,
    marginLeft: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 4,
  },
  issueCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1BE4B',
    textTransform: 'uppercase',
  },
  issueName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  durationOption: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  durationOptionActive: {
    borderColor: '#F1BE4B',
    backgroundColor: '#FFFBE6',
  },
  durationOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationOptionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationOptionIcon: {
    fontSize: 20,
    color: '#F1BE4B',
  },
  durationOptionDays: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  durationBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  durationReason: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
  durationActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  durationButtonPrimary: {
    backgroundColor: '#1A1A1A',
  },
  durationButtonSecondary: {
    backgroundColor: '#F5F5F5',
  },
  durationButtonPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  durationButtonSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  durationButtonDisabled: {
    opacity: 0.5,
  },
})
