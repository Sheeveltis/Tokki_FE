import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Text, ScrollView, Pressable, Platform, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from './roadmap-test-button'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ButtonUI from '../../../../../components/decor/buttonUI'
import {
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  CustomerServiceOutlined,
  ReadOutlined,
  EditOutlined,
  StarFilled,
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
  isEntrance = false,
  selfDeclaredLevel = 0,
}) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)
  const [confirmBackVisible, setConfirmBackVisible] = useState(false)

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

  const handleBack = () => {
    setConfirmBackVisible(true)
  }

  const confirmNavigateBack = () => {
    setConfirmBackVisible(false)
    const query = `userExamId=${encodeURIComponent(userExamId)}&level=${level}&isEntrance=${isEntrance ? '1' : '0'}&selfDeclaredLevel=${selfDeclaredLevel}`
    router.push(`/roadmap/test/result?${query}`)
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
              onPress={handleBack}
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
                <View style={styles.cardHeaderNew}>
                  <View style={styles.yellowBar} />
                  <Text style={styles.cardTitleNew}>Kỹ năng cần cải thiện</Text>
                </View>

                <View style={styles.skillList}>
                  <SkillProgressItem
                    icon={<CustomerServiceOutlined />}
                    title="Nghe"
                    count={feedbackData?.listeningIssues?.length || 0}
                    color="#4A84F6"
                    bg="#EFF4FF"
                    total={feedbackData?.listeningTotal || (level <= 2 ? 14 : 20)}
                    onOpenDetail={() => fetchDetail('listening')}
                  />
                  <SkillProgressItem
                    icon={<ReadOutlined />}
                    title="Đọc"
                    count={feedbackData?.readingIssues?.length || 0}
                    color="#F68B4A"
                    bg="#FFF4EF"
                    total={feedbackData?.readingTotal || (level <= 2 ? 17 : 20)}
                    onOpenDetail={() => fetchDetail('reading')}
                  />
                  {Number(level) > 2 && (
                    <SkillProgressItem
                      icon={<EditOutlined />}
                      title="Viết"
                      count={feedbackData?.writingIssues?.length || 0}
                      color="#4CAF50"
                      bg="#F0F9F0"
                      onOpenDetail={() => fetchDetail('writing')}
                    />
                  )}
                </View>

                <View style={styles.aiRecommendationBox}>
                  <InfoCircleOutlined style={styles.aiRecIcon} />
                  <Text style={styles.aiRecText}>
                    Dựa trên {(feedbackData?.listeningIssues?.length || 0) + (feedbackData?.readingIssues?.length || 0) + (feedbackData?.writingIssues?.length || 0)} dạng câu cần cải thiện, chúng tôi đề xuất dành tối thiểu <Text style={{ fontWeight: '700' }}>{durationOptions.find(opt => opt.recommended)?.days || 90} ngày</Text> để đạt hiệu quả cao nhất cho mục tiêu TOPIK {level || 1}.
                  </Text>
                </View>
              </View>
            </View>

            {/* Right Column: Duration Selection */}
            <View style={styles.rightColumn}>
              <View style={styles.card}>
                <View style={styles.cardHeaderNew}>
                  <Text style={styles.cardTitleNew}>Thời gian học</Text>
                </View>

                <View style={styles.durationOptionsNew}>
                  {durationOptions.map((option) => (
                    <Pressable
                      key={option.days}
                      onPress={() => setSelectedDuration(option.days)}
                      style={({ pressed, hovered }) => [
                        styles.durationOptionCard,
                        selectedDuration === option.days && styles.durationOptionCardActive,
                        option.available === false && styles.durationOptionDisabled,
                        hovered && option.available !== false && styles.durationOptionHover,
                        pressed && option.available !== false && styles.durationOptionPressed,
                      ]}
                      disabled={option.available === false}
                    >
                      <View style={[styles.durationLeftBox, selectedDuration === option.days && styles.durationLeftBoxActive]}>
                        <Text style={[styles.durationDaysNumber, selectedDuration === option.days && styles.durationDaysNumberActive]}>{option.days}</Text>
                        <Text style={[styles.durationDaysText, selectedDuration === option.days && styles.durationDaysTextActive]}>NGÀY</Text>
                      </View>
                      <View style={styles.durationMiddleBox}>
                        <View style={styles.durationTitleRow}>
                          <Text style={[styles.durationTitleText, selectedDuration === option.days && styles.durationTitleTextActive]}>
                            Lựa chọn {option.days} ngày
                          </Text>
                          {option.recommended && (
                            <View style={styles.recommendedBadgeNew}>
                              <Text style={styles.recommendedBadgeTextNew}>KHUYẾN NGHỊ</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.durationDescText}>{option.reason}</Text>
                      </View>
                      <View style={styles.durationRightBox}>
                        {selectedDuration === option.days ? (
                          <CheckCircleFilled style={styles.durationRadioActiveIcon} />
                        ) : (
                          <View style={styles.durationRadioInactive} />
                        )}
                      </View>
                    </Pressable>
                  ))}
                </View>

                {generateError && (
                  <Text style={styles.errorTextSmall}>{generateError}</Text>
                )}

                <View style={styles.actionFooter}>
                  <Pressable style={styles.aiInfoLink}>
                    <StarFilled style={styles.aiInfoStar} />
                    <Text style={styles.aiInfoText}>Tìm hiểu về Tooki tạo lộ trình cho bạn</Text>
                  </Pressable>
                  <ButtonUI
                    type="C"
                    onClick={handleCreateRoadmap}
                    disabled={!selectedDuration || isGeneratingRoadmap}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isGeneratingRoadmap ? 'Đang tạo...' : 'Tạo'}
                    </span>
                  </ButtonUI>
                </View>
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

      {/* Confirmation Modal for Back */}
      <Modal
        visible={confirmBackVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmBackVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Dừng tạo lộ trình?</Text>
            <Text style={styles.confirmMessage}>
              Bạn có chắc chắn muốn ngưng tạo lộ trình học tập không? Các thông tin đề xuất sẽ không được lưu lại.
            </Text>
            <View style={styles.confirmActions}>
              <Pressable
                onPress={() => setConfirmBackVisible(false)}
                style={styles.cancelBtn}
              >
                <Text style={styles.cancelBtnText}>Tiếp tục</Text>
              </Pressable>
              <Pressable
                onPress={confirmNavigateBack}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>Dừng tạo</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

function SkillProgressItem({ icon, title, count, color, bg, onOpenDetail }) {
  return (
    <Pressable
      style={({ pressed, hovered }) => [
        styles.skillItemWrapper,
        hovered && { opacity: 0.9 },
        pressed && { opacity: 0.7 }
      ]}
      onPress={onOpenDetail}
    >
      <View style={styles.skillItemFullRow}>
        <View style={[styles.skillIconBox, { backgroundColor: bg }]}>
          {React.cloneElement(icon, { style: { color: color, fontSize: 20 } })}
        </View>
        <View style={styles.skillItemInfo}>
          <Text style={styles.skillItemTitle}>{title}</Text>
          <Text style={styles.skillItemCount}>{count} dạng bài yếu</Text>
        </View>
        {count > 0 && (
          <View style={styles.skillDetailBtn}>
            <Text style={styles.skillDetailBtnText}>Chi tiết</Text>
          </View>
        )}
      </View>
    </Pressable>
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
    flex: 1,
    gap: 24,
  },
  rightColumn: {
    flex: 1.3,
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
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 20,
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardHeaderNew: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  yellowBar: {
    width: 6,
    height: 24,
    backgroundColor: '#FFC800',
    borderRadius: 3,
  },
  cardTitleNew: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  skillList: {
    gap: 20,
    marginTop: 8,
  },
  skillItemWrapper: {
    gap: 8,
  },
  skillItemFullRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  skillIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillItemInfo: {
    flex: 1,
    gap: 2,
  },
  skillItemTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  skillItemCount: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  skillProgressBarBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  skillProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  skillDetailBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  skillDetailBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  aiRecommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F5F8FF',
    borderRadius: 16,
    gap: 12,
  },
  aiRecIcon: {
    fontSize: 20,
    color: '#4A84F6',
    marginTop: 2,
  },
  aiRecText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
  },
  durationOptionsNew: {
    gap: 16,
    marginTop: 8,
  },
  durationOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
    gap: 16,
  },
  durationOptionCardActive: {
    borderColor: '#FFC800',
    backgroundColor: '#FFFEF5',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 20px rgba(255, 200, 0, 0.1)',
    }),
  },
  durationOptionDisabled: {
    opacity: 0.5,
  },
  durationOptionHover: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  durationOptionPressed: {
    opacity: 0.9,
  },
  durationLeftBox: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  durationLeftBoxActive: {
    backgroundColor: '#FFC800',
  },
  durationDaysNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#9CA3AF',
  },
  durationDaysNumberActive: {
    color: '#1A1A1A',
  },
  durationDaysText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#9CA3AF',
    marginTop: -2,
  },
  durationDaysTextActive: {
    color: '#1A1A1A',
  },
  durationMiddleBox: {
    flex: 1,
    gap: 6,
  },
  durationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#6B7280',
  },
  durationTitleTextActive: {
    color: '#1A1A1A',
  },
  recommendedBadgeNew: {
    backgroundColor: '#13151A',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  recommendedBadgeTextNew: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  durationDescText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
    lineHeight: 20,
  },
  durationRightBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationRadioInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  durationRadioActiveIcon: {
    fontSize: 24,
    color: '#FFC800',
  },
  actionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingTop: 0,
  },
  aiInfoLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiInfoStar: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  aiInfoText: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
})
