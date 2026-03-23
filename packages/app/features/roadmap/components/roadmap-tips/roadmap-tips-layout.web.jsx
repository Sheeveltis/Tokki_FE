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
      <Navbar />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation */}
          <View style={styles.topNavigation}>
            <Pressable 
              onPress={() => router.back()} 
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            >
              <Text style={styles.backButtonArrow}>←</Text>
              <Text style={styles.backButtonText}>Quay lại</Text>
            </Pressable>
            
            <View style={styles.breadcrumb}>
              <Text style={styles.breadcrumbText}>Học tập</Text>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>{typeLabel}</Text>
            </View>
          </View>

          {isLoading ? (
            <View style={styles.loadingWrapper}>
              <ActivityIndicator size="large" color="#FFCF6C" />
              <Text style={styles.loadingText}>Đang chuẩn bị nội dung bài học...</Text>
            </View>
          ) : error || !taskDetail ? (
            <View style={styles.errorWrapper}>
              <Text style={styles.errorText}>{error || 'Có lỗi xảy ra khi tải bài học.'}</Text>
              <RoadmapTestButton title="Thử lại ngay" onPress={onRetry} style={styles.retryButton} />
            </View>
          ) : (
            <>
              {/* Header Section */}
              <View style={styles.heroSection}>
                <View style={[styles.badgeContainer, isCompleted && styles.badgeCompleted]}>
                  <Text style={styles.badgeText}>{skill || 'Chung'}</Text>
                </View>
                <View style={styles.titleContainer}>
                  <Text style={styles.mainTitle}>{title}</Text>
                  {isCompleted && (
                    <View style={styles.completeCheckHeader}>
                      <Text style={styles.checkIcon}>✓</Text>
                    </View>
                  )}
                </View>
                <View style={styles.metaInfo}>
                  <View style={styles.metaItem}>
                    <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
                    <Text style={styles.metaText}>{typeLabel}</Text>
                  </View>
                  <View style={styles.dividerDot} />
                  <View style={styles.metaItem}>
                    <Text style={styles.metaText}>Trình độ {level}</Text>
                  </View>
                </View>
              </View>

              {/* Main Content Card */}
              <View style={styles.contentCard}>
                <View style={styles.articleContent}>
                  <HtmlViewer html={contentHtml} />
                </View>

                {/* Bottom Action Area */}
                <View style={styles.bottomActions}>
                  <View style={styles.actionDivider} />
                  
                  {taskType === 'LearnTheory' && (
                    <View style={styles.theoryActionBox}>
                      <Text style={styles.actionPrompt}>Bạn đã nắm vững lý thuyết này chưa?</Text>
                      <RoadmapTestButton
                        title={isCompleted ? 'Bạn đã học bài này' : 'Xác nhận đã học xong'}
                        onPress={onComplete}
                        disabled={isCompleted}
                        style={[styles.theoryButton, isCompleted && styles.theoryButtonCompleted]}
                      />
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
                                ? `/roadmap/test?examId=${taskDetail.examId}&level=${level}`
                                : `/roadmap/test?level=${level}`);
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
                        />
                      </View>
                    </View>
                  )}
                </View>
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
            </>
          )}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 60,
  },
  mainWrapper: {
    width: '90%',
    maxWidth: 900,
    marginTop: 32,
    gap: 24,
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }),
  },
  backButtonPressed: {
    backgroundColor: '#F9F9F9',
    transform: [{ scale: 0.98 }],
  },
  backButtonArrow: {
    fontSize: 18,
    color: '#1C1C1C',
    fontWeight: '600',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#888',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumbDivider: {
    fontSize: 13,
    color: '#DDD',
  },
  breadcrumbActive: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
  heroSection: {
    gap: 12,
    paddingHorizontal: 4,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF2CC',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 100,
  },
  badgeCompleted: {
    backgroundColor: '#E8F5E9',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C28A04',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleContainer: {
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
    flex: 1,
  },
  completeCheckHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  dividerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
  },
  contentCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  articleContent: {
    padding: 32,
    minHeight: 200,
  },
  bottomActions: {
    paddingHorizontal: 32,
    paddingBottom: 32,
    backgroundColor: '#FFF',
  },
  actionDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 24,
  },
  theoryActionBox: {
    alignItems: 'center',
    gap: 16,
  },
  practiceActionBox: {
    gap: 24,
  },
  actionPrompt: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  theoryButton: {
    minWidth: 240,
  },
  theoryButtonCompleted: {
    backgroundColor: '#E8F5E9',
    opacity: 0.8,
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
  },
  nextShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    padding: 24,
    borderRadius: 24,
    marginTop: 8,
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 30px rgba(0,0,0,0.15)' }),
  },
  nextShortcutPressed: {
    backgroundColor: '#333',
    transform: [{ scale: 0.99 }],
  },
  nextLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FF6B6B',
    letterSpacing: 2,
    marginBottom: 4,
  },
  nextTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  nextArrow: {
    fontSize: 24,
    color: '#FFF',
    fontWeight: '300',
  },
  loadingWrapper: {
    padding: 100,
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    color: '#888',
    fontSize: 15,
  },
  errorWrapper: {
    padding: 60,
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#FFF',
    borderRadius: 24,
  },
  errorText: {
    color: '#C62828',
    fontSize: 15,
    textAlign: 'center',
  },
  checkIcon: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
