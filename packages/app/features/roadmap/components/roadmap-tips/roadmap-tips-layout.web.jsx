import { useState } from 'react'
import { ScrollView, StyleSheet, Text, View, Pressable, Platform, ActivityIndicator } from 'react-native'
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

export function RoadmapTipsLayout({ tipId, taskDetail, isLoading = false, error = null, onRetry, onComplete }) {
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
                  <View style={styles.heroSection}>
                    <View style={styles.headerTop}>
                      <View style={styles.headerText}>


                        <View style={styles.titleRow}>
                          <Text style={styles.mainTitle}>{title}</Text>
                          {isCompleted && (
                            <View style={styles.completeCheckBadge}>
                              <Text style={styles.checkIcon}>✓</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.metaInfo}>
                          <View style={styles.metaItem}>
                            <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
                            <Text style={styles.metaText}>{typeLabel}</Text>
                          </View>
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

                  {/* Bottom Action Area */}
                  <View style={styles.bottomActions}>
                    <View style={styles.actionDivider} />

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
                                <Text style={styles.miniCheckIcon}>✓</Text>
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
                      <View style={styles.practiceActionBox}>
                        {taskType === 'VirtualQuiz' && skill !== 'Writing' && (
                          <View style={styles.selectionGroup}>
                            <Text style={styles.selectionLabel}>Chọn số lượng câu hỏi luyện tập:</Text>
                            <View style={styles.chipRow}>
                              {[3, 5, 10].map((num) => (
                                <Pressable
                                  key={num}
                                  onPress={() => setQuantity(num)}
                                  style={({ pressed }) => [
                                    styles.qChip,
                                    quantity === num && styles.qChipActive,
                                    pressed && styles.qChipPressed
                                  ]}
                                >
                                  <Text style={[styles.qChipText, quantity === num && styles.qChipTextActive]}>{num}</Text>
                                </Pressable>
                              ))}
                            </View>
                          </View>
                        )}

                        <View style={styles.mainActionRow}>
                          <RoadmapTestButton
                            title={taskType === 'WeeklyExam' ? 'Bắt đầu kiểm tra ngay' : 'Bắt đầu luyện tập ngay'}
                            onPress={() => {
                              if (taskType === 'WeeklyExam') {
                                router.push(taskDetail?.examId
                                  ? `/roadmap/test?examId=${taskDetail.examId}&level=${level}&taskId=${tipId}`
                                  : `/roadmap/test?level=${level}&taskId=${tipId}`);
                              } else {
                                const qTypeId = taskDetail?.questionTypeId
                                if (qTypeId) {
                                  const finalQuantity = skill === 'Writing' ? 1 : quantity
                                  router.push(`/roadmap/practice-test/${qTypeId}?taskId=${tipId}&level=${level}&quantity=${finalQuantity}`)
                                } else {
                                  alert('Không tìm thấy thông tin bộ câu hỏi.');
                                }
                              }
                            }}
                            style={styles.startBtn}
                            textStyle={styles.startBtnText}
                            hoverStyle={styles.startBtnHover}
                          />
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Next Shortcut */}
                  {!!nextId && (
                    <Pressable
                      onPress={() => router.push(`/roadmap/learning/tips/${nextId}?level=${level}&roadmap=${roadmapRaw}`)}
                      style={({ pressed }) => [styles.nextShortcut, pressed && styles.nextShortcutPressed]}
                    >
                      <View>
                        <Text style={styles.nextLabel}>BÀI TIẾP THEO</Text>
                        <Text style={styles.nextTitle} numberOfLines={1}>Chuyển sang nội dung kế tiếp</Text>
                      </View>
                      <Text style={styles.nextArrow}>→</Text>
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
  checkIcon: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
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
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#FFF8F0',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FFE8CC',
    marginTop: 12,
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
    backgroundColor: '#F4A950',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 0,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 20px rgba(244, 169, 80, 0.2)',
      transition: 'all 0.2s ease',
    }),
  },
  theoryButtonHover: {
    backgroundColor: '#FFB861',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 24px rgba(244, 169, 80, 0.3)' }),
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
  miniCheckIcon: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
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
})

