import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable, Platform, ActivityIndicator, TextInput } from 'react-native'
import { useRouter } from 'solito/navigation'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'
import { HtmlViewer } from '../../../blog/components/blog-detail/html-viewer'
import { 
  AppstoreOutlined, 
  ClockCircleOutlined, 
  TrophyOutlined, 
  UserOutlined,
  BookOutlined,
  CheckOutlined,
  PlayCircleFilled,
  RightOutlined,
  ArrowRightOutlined
} from '@ant-design/icons'

const TASK_TYPE_LABEL = {
  LearnTheory: 'Lý thuyết',
  VirtualQuiz: 'Luyện tập',
  WeeklyExam: 'Thi thử tuần',
}

export function RoadmapTipsLayout({ tipId, taskDetail, isLoading = false, error = null, onRetry, onComplete, passingScore, studyLimit }) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(10)

  const title = taskDetail?.title || 'Nội dung bài học'
  const taskType = taskDetail?.taskType
  const skill = taskDetail?.skill
  const isCompleted = taskDetail?.isCompleted
  const typeLabel = TASK_TYPE_LABEL[taskType] || taskType || 'Bài học'
  const contentHtml = String(taskDetail?.content || '')

  const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const level = queryParams?.get('level') || '1'
  const roadmapRaw = queryParams?.get('roadmap') || ''
  const roadmapIds = roadmapRaw ? roadmapRaw.split(',') : []

  const currentIndex = roadmapIds.indexOf(tipId)
  const nextId = currentIndex !== -1 && currentIndex < roadmapIds.length - 1 ? roadmapIds[currentIndex + 1] : null

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation */}
          <View style={styles.topNavigation}>
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Học tập</Text>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Pressable onPress={() => router.push('/roadmap/learning')}>
                <Text style={styles.breadcrumbText}>Lộ trình cá nhân</Text>
              </Pressable>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>{typeLabel}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#FFCF6C" />
              <Text style={styles.loadingText}>Đang chuẩn bị nội dung bài học...</Text>
            </View>
          ) : error || !taskDetail ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error || 'Có lỗi xảy ra khi tải bài học.'}</Text>
              <RoadmapTestButton title="Thử lại ngay" onPress={onRetry} style={styles.retryButton} />
            </View>
          ) : (
            <View style={styles.dashboardContainer}>
              {/* Sidebar Shortcut (Optional, keeping it simple as a single card for now to match RoadmapLearning's content card style) */}
              <View style={styles.contentCard}>
                <ScrollView
                  style={styles.contentCardScroll}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.contentCardInner}
                >
                  {/* Header Section in Card */}
                  {/* Header Section in Card */}
                  {taskType !== 'VirtualQuiz' && taskType !== 'WeeklyExam' && (
                    <>
                      <View style={styles.heroSection}>
                        <View style={styles.headerTop}>
                          <View style={styles.headerText}>
                            <View style={styles.titleRow}>
                              <Text style={styles.mainTitle}>{title}</Text>
                              {isCompleted && (
                                <View style={styles.completeCheckBadge}>
                                  <CheckOutlined style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }} />
                                </View>
                              )}
                            </View>


                          </View>

                          <View style={styles.headerActions}>
                            <Pressable
                              onPress={() => router.back()}
                              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
                            >
                              <Text style={styles.backButtonText}>Quay lại lộ trình</Text>
                            </Pressable>
                          </View>
                        </View>
                      </View>

                      {/* Main Content Card */}
                      <View style={styles.articleContent}>
                        <HtmlViewer html={contentHtml} />
                      </View>
                    </>
                  )}

                  {/* Bottom Action Area */}
                  <View style={styles.bottomActions}>
                    {taskType !== 'VirtualQuiz' && taskType !== 'WeeklyExam' && <View style={styles.actionDivider} />}

                    {taskType === 'LearnTheory' && (
                      <View style={[styles.theoryActionBox, isCompleted && styles.theoryActionBoxCompleted]}>
                        <Text style={styles.actionPrompt}>
                          {isCompleted ? 'Tuyệt vời! Bạn đã hoàn thành bài học này.' : 'Bạn đã nắm vững lý thuyết này chưa?'}
                        </Text>
                        <RoadmapTestButton
                          onPress={onComplete}
                          disabled={isCompleted}
                          style={[styles.theoryButton, isCompleted && styles.theoryButtonCompleted]}
                          hoverStyle={[styles.theoryButtonHover, isCompleted && styles.theoryButtonCompletedHover]}
                          textStyle={[styles.theoryButtonText, isCompleted && styles.theoryButtonTextCompleted]}
                        >
                          {isCompleted ? (
                            <>
                              <View style={styles.miniCheckBadge}>
                                <CheckOutlined style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }} />
                              </View>
                              <Text style={styles.theoryButtonTextCompleted}>Bạn đã học bài này</Text>
                            </>
                          ) : (
                            <Text style={styles.theoryButtonText}>Xác nhận đã học xong</Text>
                          )}
                        </RoadmapTestButton>
                      </View>
                    )}

                    {(taskType === 'VirtualQuiz' || taskType === 'WeeklyExam') && (
                      <View style={styles.preExamContainer}>
                        {/* Left Side: Exam Info */}
                        <View style={styles.examInfoMain}>
                          <View style={styles.examHeader}>
                            <View style={styles.examIconBox}>
                              <BookOutlined style={{ fontSize: 24, color: '#FFF' }} />
                            </View>
                            <View style={styles.examHeaderText}>
                              <View style={styles.examTitleRow}>
                                <Text style={styles.examTitle}>{title}</Text>
                                {isCompleted && (
                                  <View style={styles.examCheckBadge}>
                                    <CheckOutlined style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }} />
                                  </View>
                                )}
                              </View>
                              <Text style={styles.examSubtitle}>Lộ trình cá nhân • {typeLabel}</Text>
                            </View>
                          </View>

                          <Text style={styles.examDescription}>
                            {taskType === 'WeeklyExam' 
                              ? `Bài kiểm tra tổng hợp tất cả các dạng bài đã học trong tuần. Hãy chuẩn bị tâm lý thoải mái và không gian yên tĩnh trước khi bắt đầu.`
                              : `Luyện tập các câu hỏi theo chủ đề "${title}". Đây là cơ hội để bạn củng cố kiến thức và làm quen với các dạng bài thi thực tế.`
                            }
                          </Text>

                          {taskType === 'WeeklyExam' && (
                            <View style={styles.wishBox}>
                              <Text style={styles.wishText}>✨ Chúc bạn làm bài thật tốt và đạt kết quả cao nhất nhé!</Text>
                            </View>
                          )}

                          <View style={styles.statsGrid}>
                            {/* Time Limit Card */}
                            {taskDetail?.duration && (
                              <View style={styles.statCard}>
                                <View style={styles.statIconCircle}>
                                  <ClockCircleOutlined style={{ color: '#888', fontSize: 16 }} />
                                </View>
                                <View>
                                  <Text style={styles.statValue}>{taskDetail.duration} Phút</Text>
                                  <Text style={styles.statLabel}>THỜI GIAN LÀM</Text>
                                </View>
                              </View>
                            )}

                            {/* Passing Score Card */}
                            <View style={styles.statCard}>
                              <View style={styles.statIconCircle}>
                                <TrophyOutlined style={{ color: '#888', fontSize: 16 }} />
                              </View>
                               <View>
                                 <Text style={styles.statValue}>{passingScore}%</Text>
                                 <Text style={styles.statLabel}>ĐIỂM ĐẠT TỐI THIỂU</Text>
                               </View>
                            </View>

                            {/* Attempts Card */}
                            <View style={styles.statCard}>
                              <View style={styles.statIconCircle}>
                                <UserOutlined style={{ color: '#888', fontSize: 16 }} />
                              </View>
                              <View>
                                <Text style={styles.statValue}>
                                  {taskType === 'WeeklyExam' ? (isCompleted ? '0 Lần' : '1 Lần') : studyLimit}
                                </Text>
                                <Text style={styles.statLabel}>LẦN THỬ CÒN LẠI</Text>
                              </View>
                            </View>
                          </View>

                          {taskType === 'VirtualQuiz' && skill !== 'Writing' && (
                            <View style={styles.quantityInputGroup}>
                              <Text style={styles.quantityInputLabel}>Nhập số lượng câu hỏi luyện tập (tối thiểu 5):</Text>
                              <TextInput
                                style={styles.quantityInput}
                                value={String(quantity)}
                                onChangeText={(val) => {
                                  const num = parseInt(val)
                                  if (!isNaN(num)) {
                                    setQuantity(num)
                                  } else if (val === '') {
                                    setQuantity('')
                                  }
                                }}
                                keyboardType="numeric"
                                placeholder="VD: 10"
                              />
                              {quantity !== '' && quantity < 5 && (
                                <Text style={styles.errorHint}>Vui lòng chọn ít nhất 5 câu hỏi.</Text>
                              )}
                            </View>
                          )}
                        </View>

                        {/* Right Side: Start Action */}
                        <View style={styles.examStartSide}>
                          <View style={styles.playIconContainer}>
                             <PlayCircleFilled style={{ fontSize: 80, color: '#FFD666', opacity: 0.8 }} />
                          </View>
                          
                          <View style={styles.startCallToAction}>
                            <Text style={styles.startPromptTitle}>Sẵn sàng chưa?</Text>
                            <Text style={styles.startPromptSubtitle}>
                              Bạn không thể tạm dừng khi đã bắt đầu làm bài.
                            </Text>
                          </View>

                          <RoadmapTestButton
                            title="Bắt đầu ngay"
                            onPress={() => {
                              if (taskType === 'VirtualQuiz' && quantity < 5) {
                                alert('Vui lòng chọn ít nhất 5 câu hỏi để bắt đầu.');
                                return;
                              }
                              if (taskType === 'WeeklyExam' && isCompleted) {
                                alert('Bạn đã hoàn thành bài kiểm tra này.');
                                return;
                              }

                              if (taskType === 'WeeklyExam') {
                                router.push(taskDetail?.examId
                                  ? `/roadmap/test?examId=${taskDetail.examId}&level=${level}&taskId=${tipId}`
                                  : `/roadmap/test?level=${level}&taskId=${tipId}`);
                              } else {
                                const qTypeId = taskDetail?.questionTypeId
                                if (qTypeId) {
                                  const finalQuantity = skill === 'Writing' ? 1 : (quantity || 5)
                                  router.push(`/roadmap/practice-test/${qTypeId}?taskId=${tipId}&level=${level}&quantity=${finalQuantity}`)
                                } else {
                                  alert('Không tìm thấy thông tin bộ câu hỏi.');
                                }
                              }
                            }}
                            disabled={taskType === 'WeeklyExam' && isCompleted}
                            style={[styles.premiumStartBtn, taskType === 'WeeklyExam' && isCompleted && styles.btnDisabled]}
                            textStyle={styles.premiumStartBtnText}
                            hoverStyle={styles.premiumStartBtnHover}
                            icon={<RightOutlined style={{ marginLeft: 8 }} />}
                          />

                          <Pressable onPress={() => router.back()} style={styles.secondaryBackLink}>
                            <Text style={styles.secondaryBackLinkText}>Quay lại lộ trình</Text>
                          </Pressable>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Next Shortcut */}
                  {!!nextId && (
                    <Pressable
                      onPress={() => router.push(`/roadmap/learning/tips/${nextId}?level=${level}&roadmap=${roadmapRaw}`)}
                      style={({ pressed }) => [
                        styles.nextShortcut, 
                        taskType === 'LearnTheory' && styles.nextShortcutTheory,
                        pressed && (taskType === 'LearnTheory' ? styles.nextShortcutPressedTheory : styles.nextShortcutPressed)
                      ]}
                    >
                      <View>
                        <Text style={styles.nextLabel}>BÀI TIẾP THEO</Text>
                        <Text style={styles.nextTitle} numberOfLines={1}>Chuyển sang nội dung kế tiếp</Text>
                      </View>
                      <ArrowRightOutlined style={{ fontSize: 18, color: '#1A1A1A' }} />
                    </Pressable>
                  )}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflowY: 'auto',
    }),
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '95%',
    maxWidth: 1400,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
    alignSelf: 'center',
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumbDivider: {
    fontSize: 13,
    color: '#EEE',
  },
  breadcrumbActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  dashboardContainer: {
    width: '100%',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  contentCardScroll: {
    flex: 1,
  },
  contentCardInner: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    gap: 0,
  },
  heroSection: {
    gap: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 20,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  phaseBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phaseBadgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#C28A04',
    textTransform: 'uppercase',
  },
  phaseBadgeTextCompleted: {
    color: '#388E3C',
  },
  levelBadge: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 40,
    letterSpacing: -1,
  },
  completeCheckBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)' }),
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerActions: {
    paddingTop: 8,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    ...(Platform.OS === 'web' && { transition: 'all 0.2s' }),
  },
  backButtonPressed: {
    backgroundColor: '#F4A950',
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginVertical: 24,
  },
  articleContent: {
    minHeight: 80,
  },
  bottomActions: {
    marginTop: 16,
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  theoryActionBox: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginTop: 12,
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }),
  },
  theoryActionBoxCompleted: {
    backgroundColor: '#F6FCF6',
    borderColor: '#E2F2E2',
  },
  actionPrompt: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  theoryButton: {
    minWidth: 260,
    backgroundColor: '#00875A',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 20px rgba(0, 135, 90, 0.2)',
      transition: 'all 0.2s ease',
    }),
  },
  theoryButtonHover: {
    backgroundColor: '#00A36C',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 24px rgba(0, 135, 90, 0.3)' }),
  },
  theoryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  theoryButtonCompleted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#48BB78',
    borderWidth: 1.5,
    opacity: 1,
    ...(Platform.OS === 'web' && { transition: 'all 0.2s ease' }),
  },
  theoryButtonCompletedHover: {
    backgroundColor: '#F0FFF4',
    transform: [{ scale: 1.02 }],
  },
  theoryButtonTextCompleted: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '800',
  },
  miniCheckBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#48BB78',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  practiceActionBox: {
    gap: 16,
  },
  selectionGroup: {
    gap: 12,
  },
  selectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
  },
  qChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  qChipActive: {
    backgroundColor: '#FFF2CC',
    borderColor: '#FFC107',
  },
  qChipPressed: {
    opacity: 0.8,
  },
  qChipText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#444',
  },
  qChipTextActive: {
    color: '#C28A04',
  },
  mainActionRow: {
    marginTop: 8,
  },
  startBtn: {
    paddingVertical: 14,
    backgroundColor: '#F4A950',
    borderRadius: 16,
    borderWidth: 0,
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 8px 20px rgba(244, 169, 80, 0.25)',
      transition: 'all 0.2s ease',
    }),
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
  },
  startBtnHover: {
    backgroundColor: '#FFB861',
    transform: [{ scale: 1.02 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 24px rgba(244, 169, 80, 0.35)' }),
  },
  nextShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F1BE4B',
    padding: 24,
    borderRadius: 24,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#E2B03A',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 30px rgba(241, 190, 75, 0.25)',
      transition: 'all 0.2s ease',
    }),
  },
  nextShortcutPressed: {
    backgroundColor: '#E2B03A',
    transform: [{ scale: 0.98 }],
  },
  nextShortcutTheory: {
    backgroundColor: '#E6E6E6',
    borderColor: '#DDDDDD',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.03)',
    }),
  },
  nextShortcutPressedTheory: {
    backgroundColor: '#D9D9D9',
    transform: [{ scale: 0.98 }],
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: 'rgba(0, 0, 0, 0.5)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  nextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  nextArrow: {
    fontSize: 24,
    color: '#1A1A1A',
    fontWeight: '300',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    minHeight: 400,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  errorText: {
    fontSize: 16,
    color: '#C62828',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  retryButton: {
    minWidth: 160
  },
  preExamContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    marginTop: 20,
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
      minHeight: 500
    }),
  },
  examInfoMain: {
    flex: 3,
    padding: 40,
    gap: 24,
  },
  examHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  examIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#F4A950',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 16px rgba(244, 169, 80, 0.3)' }),
  },
  examHeaderText: {
    flex: 1,
    gap: 4,
  },
  examTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  examTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  examCheckBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  examSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  examDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  wishBox: {
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  wishText: {
    fontSize: 15,
    color: '#0056B3',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 8,
  },
  statCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quantityInputGroup: {
    marginTop: 8,
    gap: 10,
  },
  quantityInputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  quantityInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    width: 120,
    color: '#1A1A1A',
  },
  errorHint: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  examStartSide: {
    flex: 1.5,
    backgroundColor: '#FAFBFF',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  playIconContainer: {
    marginBottom: 8,
  },
  startCallToAction: {
    alignItems: 'center',
    gap: 8,
  },
  startPromptTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  startPromptSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 200,
  },
  premiumStartBtn: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#F4A950',
    borderRadius: 16,
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 10px 20px rgba(244, 169, 80, 0.25)',
      transition: 'all 0.3s ease',
    }),
  },
  premiumStartBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
  },
  premiumStartBtnHover: {
    backgroundColor: '#FFB861',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 14px 28px rgba(244, 169, 80, 0.35)' }),
  },
  btnDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  secondaryBackLink: {
    marginTop: 8,
  },
  secondaryBackLinkText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
})

