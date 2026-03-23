import { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Platform, Pressable, ScrollView, ActivityIndicator, Modal, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { Navbar } from '../../../../../components/navbar'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'
import { RoadmapTestButton } from '../roadmap-test/roadmap-test-button'

export function RoadmapPracticeTestLayout({ questionTypeId, taskId, quantity = 10 }) {
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [answers, setAnswers] = useState({})
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadPracticeQuestions = async () => {
      if (!questionTypeId) {
        setQuestions([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const url = ENDPOINTS.USER_EXAM.PRACTICE_QUESTIONS(questionTypeId, quantity)
        const response = await apiClient.get(url)

        if (!isMounted) return

        const payload = response?.data?.data || []
        const loadedQuestions = []

        payload.forEach((group) => {
          (group.questions || []).forEach((q) => {
            loadedQuestions.push({
              ...q,
              sharedMediaUrl: group.sharedMediaUrl,
              sharedMediaType: group.sharedMediaType,
              sharedPassageContent: group.sharedPassageContent,
            })
          })
        })

        if (loadedQuestions.length === 0) {
          setError('Không có câu hỏi luyện tập cho phần này.')
        } else {
          setQuestions(loadedQuestions)
        }
      } catch (err) {
        console.error('Failed to load practice questions:', err)
        if (isMounted) setError('Lỗi tải dữ liệu. Vui lòng thử lại sau.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadPracticeQuestions()

    return () => {
      isMounted = false
    }
  }, [questionTypeId])

  const renderHtmlText = (value, style) => {
    if (!value) return null
    if (Platform.OS === 'web') {
      return (
        <span
          style={{
            ...style,
            display: 'block',
            lineHeight: '1.7',
            wordBreak: 'break-word',
            fontFamily: 'inherit'
          }}
          dangerouslySetInnerHTML={{ __html: String(value || '') }}
        />
      )
    }
    const cleanValue = String(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
    return <Text style={style}>{cleanValue}</Text>
  }

  const handleSelectOption = (optionId) => {
    if (answers[currentIndex]) return
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionId,
    }))
  }

  const markAsComplete = async () => {
    if (!taskId) return
    try {
      await apiClient.post(ENDPOINTS.ROADMAP.COMPLETE, {
        taskId: taskId,
        performance: 'string',
      })
    } catch (err) {
      console.error('Failed to mark practice task as complete:', err)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1)
    } else {
      const total = questions.length
      const correct = questions.reduce((acc, q, idx) => {
        return acc + (answers[idx] === q.correctOptionId ? 1 : 0)
      }, 0)

      const passPercent = (correct / total) * 100
      if (passPercent >= 50) {
        markAsComplete()
      }
      setIsFinished(true)
      setConfirmVisible(true)
    }
  }

  const handleRedo = () => {
    setAnswers({})
    setCurrentIndex(0)
    setIsFinished(false)
    setConfirmVisible(false)
  }

  const handleExitPress = () => {
    if (questions.length > 0 && Object.keys(answers).length > 0 && !isFinished) {
      setIsFinished(false)
      setConfirmVisible(true)
    } else {
      router.back()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((p) => p - 1)
    }
  }

  const currentQuestion = questions[currentIndex]
  const selectedOptionId = answers[currentIndex]
  const isAnswered = !!selectedOptionId
  const isCorrect = isAnswered && selectedOptionId === currentQuestion?.correctOptionId

  const correctCount = questions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correctOptionId ? 1 : 0)
  }, 0)
  const totalQuestions = questions.length
  const passPercent = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
  const isPass = passPercent >= 50

  return (
    <View style={styles.container}>
      <View style={styles.innerWrapper}>
        {/* Header Navigation */}
        <View style={styles.header}>
          <Pressable onPress={handleExitPress} style={({ pressed }) => [styles.exitButton, pressed && styles.actionButtonPressed]}>
            <Text style={styles.exitIcon}>×</Text>
            <Text style={styles.exitText}>Thoát luyện tập</Text>
          </Pressable>

          <View style={styles.progressTracker}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tiến độ bài làm</Text>
              <Text style={styles.progressCounter}>
                {questions.length > 0 ? `${currentIndex + 1}/${questions.length}` : '--/--'}
              </Text>
            </View>
            <View style={styles.miniProgressBarBg}>
              <View
                style={[
                  styles.miniProgressBarFill,
                  { width: `${questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.scoreBadge}>
            <Text style={styles.scoreLabel}>Câu đúng</Text>
            <Text style={styles.scoreValue}>{correctCount}</Text>
          </View>
        </View>

        {/* Main Testing Area */}
        <View style={styles.mainContent}>
          {isLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#FFCF6C" />
              <Text style={styles.loadingText}>Đang chuẩn bị câu hỏi...</Text>
            </View>
          ) : error || !currentQuestion ? (
            <View style={styles.centerContent}>
              <Text style={styles.errorText}>{error || 'Không tìm thấy dữ liệu.'}</Text>
              <Pressable onPress={() => router.back()} style={styles.backLink}>
                <Text style={styles.backLinkText}>Quay lại lộ trình</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.testLayout}>
              {/* Left Column: Passage or Image */}
              {(currentQuestion.sharedPassageContent || (currentQuestion.sharedMediaUrl && currentQuestion.sharedMediaType === 'Image')) && (
                <View style={styles.passageColumn}>
                  <View style={styles.columnHeader}>
                    <View style={styles.columnTitleBadge}>
                      <Text style={styles.columnTitleBadgeText}>
                        {currentQuestion.sharedMediaType === 'Image' ? 'ẢNH MINH HỌA' : 'ĐOẠN VĂN'}
                      </Text>
                    </View>
                  </View>
                  <ScrollView style={styles.passageScroll} showsVerticalScrollIndicator={false}>
                    <View style={styles.passageCard}>
                      {currentQuestion.sharedMediaType === 'Image' ? (
                        <Image
                          source={{ uri: currentQuestion.sharedMediaUrl }}
                          style={styles.sharedImage}
                          resizeMode="contain"
                        />
                      ) : (
                        renderHtmlText(currentQuestion.sharedPassageContent, styles.passageText)
                      )}
                    </View>
                  </ScrollView>
                </View>
              )}

              {/* Right Column: Question & Answers / Writing Input */}
              <View style={[styles.questionColumn, !(currentQuestion.sharedPassageContent || (currentQuestion.sharedMediaUrl && currentQuestion.sharedMediaType === 'Image')) && styles.fullWidthColumn]}>
                <ScrollView contentContainerStyle={styles.questionScrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.questionHeader}>
                    <View style={[styles.questionBadge, { backgroundColor: isAnswered ? (isCorrect ? '#E8F5E9' : '#FFEBEE') : '#F5F5F5' }]}>
                      <Text style={[styles.questionBadgeText, { color: isAnswered ? (isCorrect ? '#2E7D32' : '#C62828') : '#888' }]}>
                        {currentQuestion.options?.length > 0 ? `CÂU HỎI ${currentIndex + 1}` : 'BÀI VIẾT'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.questionBody}>
                    {currentQuestion.content ? (
                      <View style={styles.questionTextContainer}>
                        {renderHtmlText(currentQuestion.content, styles.questionText)}
                      </View>
                    ) : null}

                    <View style={styles.optionsWrapper}>
                      {currentQuestion.options?.length > 0 ? (
                        (currentQuestion.options || []).map((option) => {
                          const isThisSelected = option.optionId === selectedOptionId
                          const isThisCorrect = option.optionId === currentQuestion.correctOptionId

                          let extraOptionStyle = null
                          let extraLabelStyle = null
                          let extraCircleStyle = null

                          if (isAnswered) {
                            if (isThisCorrect) {
                              extraOptionStyle = styles.optionStatusCorrect
                              extraLabelStyle = styles.optionLabelCorrect
                              extraCircleStyle = styles.optionCircleCorrect
                            } else if (isThisSelected) {
                              extraOptionStyle = styles.optionStatusIncorrect
                              extraLabelStyle = styles.optionLabelIncorrect
                              extraCircleStyle = styles.optionCircleIncorrect
                            } else {
                              extraOptionStyle = styles.optionStatusDisabled
                            }
                          } else if (isThisSelected) {
                            extraOptionStyle = styles.optionStatusSelected
                            extraLabelStyle = styles.optionLabelSelected
                            extraCircleStyle = styles.optionCircleSelected
                          }

                          return (
                            <Pressable
                              key={option.optionId}
                              onPress={() => handleSelectOption(option.optionId)}
                              style={({ pressed }) => [
                                styles.optionBase,
                                extraOptionStyle,
                                pressed && !isAnswered && styles.optionPressed,
                              ]}
                            >
                              <View style={[styles.optionCircleBase, extraCircleStyle]}>
                                <Text style={[styles.optionLabelBase, extraLabelStyle]}>{option.keyOption}</Text>
                              </View>

                              <View style={styles.optionContent}>
                                {option.imageUrl ? (
                                  Platform.OS === 'web' && (
                                    <img src={option.imageUrl} alt="option" style={styles.optionImg} />
                                  )
                                ) : (
                                  renderHtmlText(option.content, styles.optionText)
                                )}
                              </View>

                              {isAnswered && isThisCorrect && (
                                <View style={styles.statusBadge}>
                                  <Text style={styles.statusBadgeText}>✓</Text>
                                </View>
                              )}
                            </Pressable>
                          )
                        })
                      ) : (
                        <View style={styles.writingContainer}>
                          <View style={styles.writingInputCard}>
                            <Text style={styles.writingLabel}>Phần làm bài của bạn:</Text>
                            <span
                              contentEditable
                              placeholder="Nhập nội dung bài viết tại đây..."
                              style={{
                                display: 'block',
                                minHeight: '200px',
                                padding: '16px',
                                backgroundColor: '#FFF',
                                border: '1px solid #EEE',
                                borderRadius: '12px',
                                outline: 'none',
                                fontSize: '16px',
                                lineHeight: '1.6',
                              }}
                            />
                            <Text style={styles.writingHint}>* Lưu ý: Phần viết sẽ được hệ thống chấm điểm dựa trên cấu trúc bài làm.</Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* Footer Actions */}
        {!isLoading && !error && questions.length > 0 && (
          <View style={styles.footer}>
            <Pressable
              onPress={handlePrev}
              disabled={currentIndex === 0}
              style={({ pressed }) => [
                styles.navBtnPrev,
                currentIndex === 0 && styles.navBtnDisabled,
                pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.navBtnTextPrev}>← Quay lại</Text>
            </Pressable>

            <View style={styles.footerCenter}>
              <Text style={styles.footerHint}>
                {isAnswered ? 'Nhấn để xem câu tiếp theo' : 'Hãy chọn đáp án đúng nhất'}
              </Text>
            </View>

            <Pressable
              onPress={handleNext}
              style={({ pressed }) => [
                styles.navBtnNext,
                pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.navBtnTextNext}>
                {currentIndex < questions.length - 1 ? "Câu tiếp theo →" : "XEM KẾT QUẢ"}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Completion & Exit Modal */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.resultModal}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isFinished && (isPass ? styles.titlePass : styles.titleFail)]}>
                {isFinished ? (isPass ? 'HOÀN THÀNH!' : 'CỐ GẮNG HƠN!') : 'DỪNG LUYỆN TẬP?'}
              </Text>
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.modalMessage}>
                {isFinished
                  ? (isPass
                    ? "Bạn đã vượt qua bài luyện tập này một cách xuất sắc! Tiến độ đã được ghi nhận."
                    : "Bạn chưa đạt đủ 50% câu đúng để hoàn thành bài tập. Hãy thử sức lại nhé!")
                  : "Mọi nỗ lực của bạn sẽ mất nếu bạn thoát ngay bây giờ. Bạn có chắc chắn muốn thoát?"}
              </Text>

              {isFinished && (
                <View style={styles.scoreContainer}>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreBoxLabel}>Điểm số</Text>
                    <Text style={styles.scoreBoxValue}>{passPercent}%</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreBoxLabel}>Câu đúng</Text>
                    <Text style={styles.scoreBoxValue}>{correctCount}/{totalQuestions}</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={isFinished ? handleRedo : () => setConfirmVisible(false)}
                style={({ pressed }) => [styles.modalBtnSecondary, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.modalBtnSecondaryText}>
                  {isFinished ? 'Luyện tập lại' : 'Tiếp tục làm'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setConfirmVisible(false)
                  router.back()
                }}
                style={({ pressed }) => [styles.modalBtnPrimary, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.modalBtnPrimaryText}>
                  {isFinished ? 'Về trang chủ' : 'Xác nhận thoát'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    overflow: 'hidden',
  },
  innerWrapper: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  header: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    zIndex: 10,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  exitIcon: {
    fontSize: 22,
    color: '#666',
    marginTop: -2,
  },
  exitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  progressTracker: {
    flex: 1,
    maxWidth: 400,
    marginHorizontal: 32,
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    textTransform: 'uppercase',
  },
  progressCounter: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  miniProgressBarBg: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 100,
    overflow: 'hidden',
  },
  miniProgressBarFill: {
    height: '100%',
    backgroundColor: '#FFCF6C',
    borderRadius: 100,
    ...(Platform.OS === 'web' && { transition: 'width 0.4s ease' }),
  },
  scoreBadge: {
    alignItems: 'center',
    backgroundColor: '#F8FAF3',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
    textTransform: 'uppercase',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
  },
  mainContent: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FAFAFA',
  },
  testLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  passageColumn: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#EAEAEA',
    backgroundColor: '#FDFDFD',
  },
  columnHeader: {
    padding: 20,
    paddingBottom: 0,
  },
  columnTitleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  columnTitleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
  },
  passageScroll: {
    flex: 1,
  },
  passageCard: {
    padding: 24,
    paddingTop: 12,
  },
  passageText: {
    fontSize: 17,
    color: '#1A1A1A',
    lineHeight: 28,
    fontFamily: 'Epilogue, sans-serif',
  },
  questionColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullWidthColumn: {
    flex: 2,
  },
  questionScrollContent: {
    padding: 20,
    paddingHorizontal: 120,
    paddingBottom: 60,
  },
  questionHeader: {
    marginBottom: 20,
  },
  questionBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    // letterSpacing: 1,
  },
  questionBody: {
    gap: 24,
  },
  questionTextContainer: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 32,
    fontFamily: 'Epilogue, sans-serif',
  },
  optionsWrapper: {
    gap: 16,
  },
  optionBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 16,
    marginVertical: 4,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  optionPressed: {
    transform: [{ scale: 0.985 }],
    backgroundColor: '#FAFAFA',
  },
  optionStatusSelected: {
    backgroundColor: '#FFFBF0',
    borderColor: '#FFCF6C',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(255, 207, 108, 0.12)' }),
  },
  optionStatusCorrect: {
    backgroundColor: '#F1F9F1',
    borderColor: '#4CAF50',
  },
  optionStatusIncorrect: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF5252',
  },
  optionStatusDisabled: {
    opacity: 0.5,
    backgroundColor: '#FAFAFA',
    borderColor: '#F0F0F0',
  },
  optionCircleBase: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionCircleSelected: {
    backgroundColor: '#FFCF6C',
    borderColor: '#FFCF6C',
  },
  optionCircleCorrect: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  optionCircleIncorrect: {
    backgroundColor: '#FF5252',
    borderColor: '#FF5252',
  },
  optionLabelBase: {
    fontSize: 15,
    fontWeight: '800',
    color: '#888',
  },
  optionLabelSelected: {
    color: '#FFF',
  },
  optionLabelCorrect: {
    color: '#FFF',
  },
  optionLabelIncorrect: {
    color: '#FFF',
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#222',
  },
  optionImg: {
    maxWidth: '100%',
    borderRadius: 12,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  navBtnPrev: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  navBtnDisabled: {
    opacity: 0.3,
  },
  navBtnTextPrev: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  footerCenter: {
    alignItems: 'center',
  },
  footerHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#AAA',
    fontStyle: 'italic',
  },
  navBtnNext: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 16,
    minWidth: 160,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }),
  },
  navBtnTextNext: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFF',
  },
  actionButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(5px)' }),
  },
  resultModal: {
    backgroundColor: '#FFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }),
  },
  modalHeader: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 1,
  },
  titlePass: { color: '#4CAF50' },
  titleFail: { color: '#FF5252' },
  modalContent: {
    alignItems: 'center',
    gap: 24,
    width: '100%',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  scoreContainer: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  scoreBox: {
    alignItems: 'center',
  },
  scoreBoxLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  scoreBoxValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  divider: {
    width: 1,
    backgroundColor: '#EAEAEA',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    width: '100%',
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontWeight: '800',
    color: '#666',
  },
  modalBtnPrimary: {
    flex: 1.2,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontWeight: '800',
    color: '#FFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF5252',
    fontWeight: '600',
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    color: '#4CAF50',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  sharedImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
  },
  writingContainer: {
    width: '100%',
    padding: 0,
  },
  writingInputCard: {
    backgroundColor: '#FAFAFA',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  writingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  writingHint: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 8,
  },
})
