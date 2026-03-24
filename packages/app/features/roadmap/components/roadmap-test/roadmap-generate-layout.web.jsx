import { useState } from 'react'
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

export function RoadmapGenerateLayout({
  userExamId,
  level,
  feedbackData = null,
  feedbackLoading = false,
  feedbackError = null,
  onGenerateRoadmap,
  isGeneratingRoadmap = false,
  generateError = null,
}) {
  const router = useRouter()
  const [selectedDuration, setSelectedDuration] = useState(null)
  const [expandedSection, setExpandedSection] = useState(null)

  const hasFeedback = Boolean(feedbackData)
  const durationOptions = feedbackData?.durationOptions || []

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
    const roadmapId = await onGenerateRoadmap?.({
      durationDays: selectedDuration,
    })
    if (roadmapId) {
      router.push('/roadmap/learning')
    }
  }

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại kết quả"
              to={undefined}
              icon={ArrowIcon}
              onPress={() => router.back()}
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
                <View style={styles.feedbackCard}>
                  <View style={styles.feedbackBadge}>
                    <CheckCircleOutlined style={styles.feedbackBadgeIcon} />
                    <Text style={styles.feedbackBadgeText}>AI Feedback</Text>
                  </View>
                  <Text style={styles.feedbackText}>
                    {feedbackData?.aiFeedback || 'Hệ thống đang phân tích bài làm của bạn để đưa ra lời khuyên phù hợp nhất.'}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <OrderedListOutlined style={styles.cardIcon} />
                  <Text style={styles.cardTitle}>Cần cải thiện</Text>
                </View>
                <View style={styles.issueList}>
                  <IssueSection
                    title="Nghe"
                    issues={feedbackData?.listeningIssues}
                    isExpanded={expandedSection === 'listening'}
                    onToggle={() => setExpandedSection(expandedSection === 'listening' ? null : 'listening')}
                  />
                  <IssueSection
                    title="Đọc"
                    issues={feedbackData?.readingIssues}
                    isExpanded={expandedSection === 'reading'}
                    onToggle={() => setExpandedSection(expandedSection === 'reading' ? null : 'reading')}
                  />
                  <IssueSection
                    title="Viết"
                    issues={feedbackData?.writingIssues}
                    isExpanded={expandedSection === 'writing'}
                    onToggle={() => setExpandedSection(expandedSection === 'writing' ? null : 'writing')}
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
    </View>
  )
}

function IssueSection({ title, issues, isExpanded, onToggle }) {
  return (
    <View style={styles.issueSection}>
      <Pressable
        onPress={onToggle}
        style={[styles.issueHeaderRow, isExpanded && styles.issueHeaderRowActive]}
      >
        <OrderedListOutlined style={styles.issueHeaderIcon} />
        <Text style={styles.issueSectionTitle}>{title}</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    paddingBottom: 100,
  },
  content: {
    width: '100%',
    maxWidth: 1100,
    gap: 32,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerSection: {
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
    maxWidth: 600,
    lineHeight: 24,
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
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 20,
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
    fontSize: 22,
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
    fontSize: 16,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 26,
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
    padding: 18,
    borderRadius: 16,
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
})
