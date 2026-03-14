import React, { useState } from 'react'
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Modal } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from './roadmap-test-button'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavigationPill } from '../../../../../components/navigation-pill'

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
  analysisData = null,
  analysisLoading = false,
  durationOptions = [],
  durationLoading = false,
  durationError = null,
  isDurationModalOpen = false,
  onOpenDurationModal,
  onCloseDurationModal,
}) {
  const router = useRouter()
  const [analysisExpanded, setAnalysisExpanded] = useState(false)
  const [selectedDuration, setSelectedDuration] = useState(null)

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
  const hasDurationOptions = Array.isArray(durationOptions) && durationOptions.length > 0
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
            {listening && (
              <SectionScoreCard
                label="Nghe"
                score={listening.score}
                maxScore={listening.maxScore}
                correctAnswers={listening.correctAnswers}
                totalQuestions={listening.totalQuestions}
                onViewDetail={() => router.push(toDetail('listening'))}
              />
            )}
            {reading && (
              <SectionScoreCard
                label="Đọc"
                score={reading.score}
                maxScore={reading.maxScore}
                correctAnswers={reading.correctAnswers}
                totalQuestions={reading.totalQuestions}
                onViewDetail={() => router.push(toDetail('reading'))}
              />
            )}
            {writing && (
              <SectionScoreCard
                label="Viết"
                score={writing.score}
                maxScore={writing.maxScore}
                correctAnswers={writing.correctAnswers}
                totalQuestions={writing.totalQuestions}
                onViewDetail={() => router.push(toDetail('writing'))}
                isGraded={isGraded}
              />
            )}
          </View>

          {(analysisLoading || analysisData) && (
            <View style={styles.analysisCard}>
              <Pressable
                onPress={() => setAnalysisExpanded((prev) => !prev)}
                style={({ pressed }) => [
                  styles.analysisHeader,
                  pressed && styles.analysisHeaderPressed,
                ]}
              >
                <View style={styles.analysisHeaderLeft}>
                  <Text style={styles.analysisTitle}>Phân tích điểm yếu</Text>
                  <Text style={styles.analysisSubtitle}>
                    {analysisExpanded ? 'Thu gọn' : 'Mở xem chi tiết'}
                  </Text>
                </View>
                <Text style={styles.analysisChevron}>{analysisExpanded ? '▲' : '▼'}</Text>
              </Pressable>

              {analysisExpanded && (
                <View style={styles.analysisBody}>
                  {analysisLoading && (
                    <Text style={styles.analysisLoadingText}>Đang tải phân tích...</Text>
                  )}
                  {!analysisLoading && analysisData && (
                    <View style={styles.analysisGrid}>
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisSectionTitle}>Nghe</Text>
                        {analysisData.listeningIssues?.length ? (
                          analysisData.listeningIssues.map((item) => (
                            <Text key={item.questionTypeId} style={styles.analysisItemText}>
                              • {item.name || item.code}
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.analysisEmptyText}>Không có lỗi</Text>
                        )}
                      </View>
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisSectionTitle}>Đọc</Text>
                        {analysisData.readingIssues?.length ? (
                          analysisData.readingIssues.map((item) => (
                            <Text key={item.questionTypeId} style={styles.analysisItemText}>
                              • {item.name || item.code}
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.analysisEmptyText}>Không có lỗi</Text>
                        )}
                      </View>
                      <View style={styles.analysisSection}>
                        <Text style={styles.analysisSectionTitle}>Viết</Text>
                        {analysisData.writingIssues?.length ? (
                          analysisData.writingIssues.map((item) => (
                            <Text key={item.questionTypeId} style={styles.analysisItemText}>
                              • {item.name || item.code}
                            </Text>
                          ))
                        ) : (
                          <Text style={styles.analysisEmptyText}>Không có lỗi</Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          <View style={styles.actionsRow}>
            <RoadmapTestButton
              title="Tạo lộ trình"
              onPress={onOpenDurationModal}
              disabled={!hasDurationOptions && !durationLoading}
              style={[styles.actionButton, styles.actionButtonPrimary]}
            />
            <RoadmapTestButton
              title="Về trang lộ trình"
              onPress={() => router.push('/roadmap/info')}
              style={[styles.actionButton, styles.actionButtonSecondary]}
            />
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isDurationModalOpen}
        transparent
        animationType="fade"
        onRequestClose={onCloseDurationModal}
      >
        <View style={styles.durationOverlay}>
          <View style={styles.durationModal}>
            <Text style={styles.durationTitle}>Chọn thời gian học</Text>
            <Text style={styles.durationSubtitle}>
              Chúng tôi đề xuất thời lượng phù hợp để cải thiện điểm yếu của bạn.
            </Text>

            {durationLoading && (
              <Text style={styles.durationLoadingText}>Đang tải đề xuất...</Text>
            )}

            {!durationLoading && durationError && (
              <Text style={styles.durationErrorText}>{durationError}</Text>
            )}

            {!durationLoading && !durationError && hasDurationOptions && (
              <View style={styles.durationOptions}>
                {durationOptions.map((option) => (
                  <Pressable
                    key={option.days}
                    onPress={() => setSelectedDuration(option.days)}
                    style={({ pressed }) => [
                      styles.durationOption,
                      selectedDuration === option.days && styles.durationOptionActive,
                      option.available === false && styles.durationOptionDisabled,
                      pressed && option.available !== false && styles.durationOptionPressed,
                    ]}
                    disabled={option.available === false}
                  >
                    <View style={styles.durationOptionHeader}>
                      <Text
                        style={[
                          styles.durationOptionDays,
                          selectedDuration === option.days && styles.durationOptionDaysActive,
                        ]}
                      >
                        {option.days} ngày
                      </Text>
                      {option.recommended && (
                        <Text style={styles.durationBadge}>Khuyến nghị</Text>
                      )}
                    </View>
                    <Text style={styles.durationReason}>{option.reason}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={styles.durationActions}>
              <Pressable
                onPress={onCloseDurationModal}
                style={({ pressed }) => [
                  styles.durationButton,
                  styles.durationButtonSecondary,
                  pressed && styles.durationButtonPressed,
                ]}
              >
                <Text style={styles.durationButtonSecondaryText}>Để sau</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!selectedDuration) return
                  onCloseDurationModal?.()
                  router.push('/roadmap/learning')
                }}
                style={({ pressed }) => [
                  styles.durationButton,
                  styles.durationButtonPrimary,
                  !selectedDuration && styles.durationButtonDisabled,
                  pressed && selectedDuration && styles.durationButtonPressed,
                ]}
                disabled={!selectedDuration}
              >
                <Text style={styles.durationButtonPrimaryText}>Tạo lộ trình</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFE0B3',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.06)',
    }),
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFF6E8',
  },
  analysisHeaderPressed: {
    opacity: 0.9,
  },
  analysisHeaderLeft: {
    gap: 4,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  analysisSubtitle: {
    fontSize: 13,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  analysisChevron: {
    fontSize: 14,
    color: '#5F5F5F',
    fontWeight: '700',
  },
  analysisBody: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  analysisLoadingText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  analysisGrid: {
    gap: 16,
  },
  analysisSection: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFF9F2',
    borderWidth: 1,
    borderColor: '#FFE6C8',
    gap: 6,
  },
  analysisSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E6B2B',
    fontFamily: 'Epilogue, sans-serif',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  analysisItemText: {
    fontSize: 14,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  analysisEmptyText: {
    fontSize: 14,
    color: '#8E8E8E',
    fontFamily: 'Epilogue, sans-serif',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
    marginTop: 8,
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
    maxWidth: 560,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: '#FFE0B3',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 14px 30px rgba(0,0,0,0.15)',
    }),
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
  durationButtonSecondary: {
    backgroundColor: '#FFF4DA',
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
