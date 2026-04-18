import { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Image } from 'react-native'
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
import { Modal } from 'react-native'
import { RoadmapTestResultDetailView } from './roadmap-test-result-detail-view'
import { apiClient } from '../../../../provider/api/client'

export function RoadmapGenerateLayout({
  userExamId,
  level,
  feedbackData = null,
  feedbackLoading = false,
  feedbackError = null,
  onGenerateRoadmap,
  isGeneratingRoadmap = false,
  generateError = null,
  progressData = null,
}) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)

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

  const hasFeedback = Boolean(feedbackData)
  const durationOptions = feedbackData?.durationOptions || []

  // Effect to handle navigation when progressData shows completion
  useEffect(() => {
    if (progressData?.isCompleted && progressData?.roadmapId) {
      router.push('/roadmap/learning')
    }
  }, [progressData, router])

  if (feedbackLoading) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Đang tải thông tin lộ trình...</Text>
        </View>
      </View>
    )
  }

  if (feedbackError) {
    return (
      <View style={styles.wrapper}>
        <Navbar />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{feedbackError}</Text>
          <RoadmapTestButton
            title="Quay lại"
            onPress={() => router.back()}
            style={styles.backButton}
          />
        </View>
      </View>
    )
  }

  const handleCreateRoadmap = async () => {
    if (!selectedDuration || isGeneratingRoadmap) return
    await onGenerateRoadmap?.({
      durationDays: selectedDuration,
    })
  }



  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              onPress={() => router.push(`/roadmap/test/result?userExamId=${encodeURIComponent(userExamId)}`)}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          <View style={styles.headerSection}>
            <Text style={styles.title}>Thiết lập lộ trình</Text>
            <Text style={styles.subtitle}>
              Dựa trên kết quả bài thi của bạn, hệ thống đã đề xuất lộ trình phù hợp nhất.
            </Text>
          </View>

          <View style={styles.gridContainer}>
            {/* Left Column: AI Feedback & Issues */}
            <View style={styles.leftColumn}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <InfoCircleOutlined style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Phản hồi từ AI</Text>
                </View>
                <Text style={styles.feedbackText}>
                  {feedbackData?.aiFeedback || 'Hệ thống đang phân tích bài làm của bạn để đưa ra lời khuyên phù hợp nhất.'}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <OrderedListOutlined style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Cần cải thiện</Text>
                </View>
                <View style={styles.issueList}>
                  <IssueSection
                    title="Nghe"
                    sectionKey="listening"
                    userExamId={userExamId}
                    issues={feedbackData?.listeningIssues}
                    isExpanded={expandedSection === 'listening'}
                    onToggle={() => setExpandedSection(expandedSection === 'listening' ? null : 'listening')}
                    onOpenDetail={() => fetchDetail('listening')}
                  />
                  <IssueSection
                    title="Đọc"
                    sectionKey="reading"
                    userExamId={userExamId}
                    issues={feedbackData?.readingIssues}
                    isExpanded={expandedSection === 'reading'}
                    onToggle={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
                    onOpenDetail={() => fetchDetail('reading')}
                  />
                  <IssueSection
                    title="Viết"
                    sectionKey="writing"
                    userExamId={userExamId}
                    issues={feedbackData?.writingIssues}
                    isExpanded={expandedSection === 'writing'}
                    onToggle={() => setExpandedSection(expandedSection === 'writing' ? null : 'writing')}
                    onOpenDetail={() => fetchDetail('writing')}
                  />
                </View>
              </View>
            </View>

            {/* Right Column: Duration Selection */}
            <View style={styles.rightColumn}>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <ClockCircleOutlined style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Thời gian học</Text>
                </View>
                <Text style={styles.cardSubtitle}>
                  Hãy chọn thời gian bạn muốn dành ra để đạt được mục tiêu TOPIK {level || 1}.
                </Text>

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

                {generateError && (
                  <Text style={styles.errorTextSmall}>{generateError}</Text>
                )}

                <RoadmapTestButton
                  title={isGeneratingRoadmap ? 'Đang tạo lộ trình...' : 'Tạo lộ trình ngay'}
                  onPress={handleCreateRoadmap}
                  disabled={!selectedDuration || isGeneratingRoadmap}
                  style={styles.submitButton}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
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
      </Modal>

      {/* Progress Modal */}
      <Modal
        visible={isGeneratingRoadmap && !!progressData}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Đang tạo lộ trình của bạn</Text>
            <Text style={styles.progressStep}>{progressData?.step || 'Đang chuẩn bị...'}</Text>

            <View style={styles.progressBarWrapper}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${progressData?.percent || 0}%` },
                ]}
              />
            </View>

            <View style={styles.progressFooter}>
              <Text style={styles.progressPercent}>{progressData?.percent || 0}%</Text>
              <Text style={styles.progressNote}>Có thể mất khoảng 1 phút. Vui lòng không đóng trang này.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function IssueSection({ title, sectionKey, userExamId, issues, isExpanded, onToggle, onOpenDetail }) {
  return (
    <View style={styles.issueSection}>
      <Pressable
        onPress={onToggle}
        style={[styles.issueHeaderRow, isExpanded && styles.issueHeaderRowActive]}
      >
        <OrderedListOutlined style={styles.issueHeaderIcon} />
        <Text style={styles.issueSectionTitle}>{title}</Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation()
            onOpenDetail?.()
          }}
          style={styles.issueDetailLink}
        >
          <Text style={styles.issueDetailLinkText}>Chi tiết</Text>
        </Pressable>
      </Pressable>
      {isExpanded && (
        <View style={styles.issueItems}>
          {issues?.length ? (
            issues.map((item) => (
              <View key={item.questionTypeId} style={styles.issueItem}>
                <Text style={styles.issueCode}>{item.code}</Text>
                <Text style={styles.issueName}>{item.name}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.issueEmptyText}>Tuyệt vời! Không có lỗi nào được phát hiện trong phần này.</Text>
          )}
        </View>
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
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    gap: 20,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerSection: {
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
    maxWidth: 600,
    lineHeight: 20,
  },
  gridContainer: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 24,
  },
  leftColumn: {
    flex: 1.2,
    gap: 24,
  },
  rightColumn: {
    flex: 0.8,
    gap: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  cardIcon: {
    fontSize: 24,
    color: '#F1BE4B',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
    lineHeight: 22,
  },
  feedbackCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 24,
    padding: 24,
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  feedbackBadgeIcon: {
    fontSize: 14,
    color: '#F1BE4B',
  },
  feedbackBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F1BE4B',
    textTransform: 'uppercase',
  },
  feedbackText: {
    fontSize: 15,
    textAlign: 'justify',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
    fontWeight: '500',
  },
  issueList: {
    gap: 12,
  },
  issueSection: {
    gap: 8,
  },
  issueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  issueHeaderRowActive: {
    backgroundColor: '#FFFBE6',
    borderColor: '#F1BE4B',
  },
  issueHeaderIcon: {
    fontSize: 18,
    color: '#F1BE4B',
  },
  issueSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
    flex: 1,
  },
  issueDetailLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  issueDetailLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F1BE4B',
  },
  issueItems: {
    paddingLeft: 12,
    gap: 8,
    marginTop: 4,
  },
  issueItem: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 4,
  },
  issueCode: {
    fontSize: 11,
    fontWeight: '900',
    color: '#F1BE4B',
    textTransform: 'uppercase',
  },
  issueName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  issueEmptyText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    padding: 12,
  },
  durationOptions: {
    gap: 16,
    marginTop: 8,
  },
  durationOption: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#F9FAFB',
    gap: 8,
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
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    textTransform: 'uppercase',
  },
  durationReason: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    lineHeight: 20,
  },
  durationOptionDisabled: {
    opacity: 0.5,
  },
  submitButton: {
    marginTop: 12,
    paddingVertical: 18,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    fontWeight: '600',
  },
  errorTextSmall: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 8,
  },
  backButton: {
    minWidth: 160,
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
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    gap: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  progressTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  progressStep: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
    minHeight: 44,
  },
  progressBarWrapper: {
    width: '100%',
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 6,
  },
  progressFooter: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F1BE4B',
  },
  progressNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
})
