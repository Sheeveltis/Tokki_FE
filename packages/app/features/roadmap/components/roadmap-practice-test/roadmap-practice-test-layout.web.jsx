import { useState, useEffect } from 'react'
import { StyleSheet, View, Text, Platform, Pressable, ScrollView, ActivityIndicator, Modal, Image } from 'react-native'
import { useRouter } from 'solito/navigation'
import { apiClient } from '../../../../provider/api/client'
import { ENDPOINTS } from '../../../../provider/api/endpoints'

export function RoadmapPracticeTestLayout({ questionTypeId, taskId, quantity = 10 }) {
  const router = useRouter()
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [answers, setAnswers] = useState({})
  const [confirmVisible, setConfirmVisible] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  // Hover states for web
  const [exitHovered, setExitHovered] = useState(false)
  const [prevHovered, setPrevHovered] = useState(false)
  const [nextHovered, setNextHovered] = useState(false)
  const [hoveredOptionId, setHoveredOptionId] = useState(null)

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

        payload.forEach((item) => {
          if (item.questions && Array.isArray(item.questions)) {
            item.questions.forEach((q) => {
              loadedQuestions.push({
                ...q,
                sharedMediaUrl: item.sharedMediaUrl,
                sharedMediaType: item.sharedMediaType,
                sharedPassageContent: item.sharedPassageContent,
              })
            })
          } else {
            // Trường hợp dữ liệu trả về flat array (câu hỏi trực tiếp)
            loadedQuestions.push(item)
          }
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

  const markAsComplete = async (performanceValue) => {
    if (!taskId) return
    try {
      await apiClient.post(ENDPOINTS.ROADMAP.COMPLETE, {
        taskId: taskId,
        performance: performanceValue || 'Completed',
      })
    } catch (err) {
      console.error('Failed to mark practice task as complete:', err)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1)
    } else if (!isFinished) {
      const total = questions.length
      const correct = questions.reduce((acc, q, idx) => {
        return acc + (answers[idx] === q.correctOptionId ? 1 : 0)
      }, 0)

      const passPercentValue = total > 0 ? (correct / total) * 100 : 0
      if (passPercentValue >= 50) {
        markAsComplete(`Achieved ${Math.floor(passPercentValue)}%`)
      }
      setIsFinished(true)
      setConfirmVisible(true)
    } else {
      // Đã xong rồi thì chỉ hiện lại modal kết quả
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
        {/* Header Navigation - Synchronized with Roadmap Dashboard */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable 
              onPress={handleExitPress} 
              onMouseEnter={() => setExitHovered(true)}
              onMouseLeave={() => setExitHovered(false)}
              style={({ pressed }) => [
                styles.exitButton, 
                exitHovered && styles.exitButtonHovered,
                pressed && styles.actionButtonPressed
              ]}
            >
              <Text style={styles.exitIcon}>×</Text>
              <Text style={styles.exitText}>Thoát</Text>
            </Pressable>
          </View>

          <View style={styles.progressTracker}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Tiến độ</Text>
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

          <View style={styles.headerRight}>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>Câu đúng</Text>
              <Text style={styles.scoreValue}>{correctCount}</Text>
            </View>
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
              {(currentQuestion.sharedPassageContent || (currentQuestion.sharedMediaUrl && (currentQuestion.sharedMediaType === 'Image' || currentQuestion.sharedMediaType === 'Audio'))) && (
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
                      ) : currentQuestion.sharedMediaType === 'Audio' ? (
                        <View style={styles.audioWrapper}>
                          <audio controls src={currentQuestion.sharedMediaUrl} style={{ width: '100%' }} />
                        </View>
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

                    {currentQuestion.mediaUrl ? (
                      <View style={styles.questionAudioWrapper}>
                        <audio controls src={currentQuestion.mediaUrl} style={{ width: '101%', height: 45 }} />
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
                              onMouseEnter={() => !isAnswered && setHoveredOptionId(option.optionId)}
                              onMouseLeave={() => setHoveredOptionId(null)}
                              style={({ pressed }) => [
                                styles.optionBase,
                                hoveredOptionId === option.optionId && !isAnswered && styles.optionHovered,
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
                                <View style={styles.ansStatusBadge}>
                                  <Text style={styles.ansStatusBadgeText}>✓</Text>
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
                                color: '#1A1A1A'
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
              onMouseEnter={() => setPrevHovered(true)}
              onMouseLeave={() => setPrevHovered(false)}
              disabled={currentIndex === 0}
              style={({ pressed }) => [
                styles.navBtnPrev,
                prevHovered && currentIndex !== 0 && styles.navBtnPrevHovered,
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
              onMouseEnter={() => setNextHovered(true)}
              onMouseLeave={() => setNextHovered(false)}
              style={({ pressed }) => [
                styles.navBtnNext,
                nextHovered && styles.navBtnNextHovered,
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

            <View style={styles.resModalContent}>
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
    backgroundColor: '#FAFAFA',
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
    paddingHorizontal: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFF',
    zIndex: 10,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEE',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    transition: 'all 0.2s ease',
  },
  exitButtonHovered: {
    backgroundColor: '#F0F0F0',
    transform: [{ scale: 1.02 }],
  },
  exitIcon: {
    fontSize: 22,
    color: '#333',
    marginTop: -2,
    fontWeight: '300',
  },
  exitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
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
  progressTracker: {
    flex: 1,
    maxWidth: 450,
    marginHorizontal: 40,
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressCounter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  miniProgressBarBg: {
    height: 6,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F1F9F1',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E1EEDD',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
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
    borderRightColor: '#F0F0F0',
    backgroundColor: '#FDFDFD',
  },
  columnHeader: {
    padding: 24,
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
  sharedImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 16,
    marginBottom: 16,
  },
  questionColumn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  fullWidthColumn: {
    flex: 2,
  },
  questionScrollContent: {
    padding: 40,
    paddingHorizontal: '15%',
    paddingBottom: 100,
  },
  questionHeader: {
    marginBottom: 24,
  },
  questionBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  questionBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  questionBody: {
    gap: 32,
  },
  questionTextContainer: {
    marginBottom: 8,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 34,
    fontFamily: 'Epilogue, sans-serif',
  },
  optionsWrapper: {
    gap: 16,
  },
  optionBase: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    gap: 18,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
    }),
  },
  optionHovered: {
    borderColor: '#FFCF6C',
    backgroundColor: '#FFFBF5',
    transform: [{ translateY: -2 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(255, 207, 108, 0.15)' }),
  },
  optionPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#F9F9F9',
  },
  optionStatusSelected: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFCF6C',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 20px rgba(255, 207, 108, 0.12)' }),
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionCircleSelected: {
    backgroundColor: '#FFCF6C',
  },
  optionCircleCorrect: {
    backgroundColor: '#4CAF50',
  },
  optionCircleIncorrect: {
    backgroundColor: '#FF5252',
  },
  optionLabelBase: {
    fontSize: 16,
    fontWeight: '800',
    color: '#999',
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    lineHeight: 24,
  },
  optionImg: {
    maxWidth: '100%',
    maxHeight: 180,
    objectFit: 'contain',
    borderRadius: 12,
  },
  ansStatusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ansStatusBadgeText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
  writingContainer: {
    marginTop: 8,
  },
  writingInputCard: {
    gap: 16,
  },
  writingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  writingHint: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  navBtnPrev: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    transition: 'all 0.2s ease',
  },
  navBtnPrevHovered: {
    backgroundColor: '#EEEEEE',
    transform: [{ translateX: -3 }],
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    minWidth: 180,
    alignItems: 'center',
    transition: 'all 0.25s ease',
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }),
  },
  navBtnNextHovered: {
    backgroundColor: '#333333',
    transform: [{ translateY: -3 }],
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 32px rgba(0,0,0,0.2)' }),
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
    ...(Platform.OS === 'web' && { backdropFilter: 'blur(6px)' }),
  },
  resultModal: {
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 40,
    width: '90%',
    maxWidth: 500,
    ...(Platform.OS === 'web' && { boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }),
  },
  modalHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  titlePass: {
    color: '#4CAF50',
  },
  titleFail: {
    color: '#FF6B6B',
  },
  resModalContent: {
    gap: 24,
    marginBottom: 32,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  scoreBox: {
    alignItems: 'center',
    gap: 4,
  },
  scoreBoxLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreBoxValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: '#EEE',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtnSecondary: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666',
  },
  modalBtnPrimary: {
    flex: 1.5,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 15,
    color: '#888',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    maxWidth: '80%',
  },
  backLink: {
    marginTop: 10,
    padding: 10,
  },
  backLinkText: {
    color: '#F4A950',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  audioWrapper: {
    padding: 16,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginTop: 8,
  },
  questionAudioWrapper: {
    padding: 12,
    backgroundColor: '#FFF8F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFECC8',
    marginBottom: 8,
  },
})

