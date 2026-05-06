import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Dimensions } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { FlashcardActionButton } from '../../../study/components/shared'
import PronunciationIcon from '../../../../../assets/icon/icon-mainflow/micro.svg'
import TypingIcon from '../../../../../assets/icon/icon-mainflow/write.svg'
import DrawingIcon from '../../../../../assets/icon/icon-mainflow/bulb.svg'
import TestIcon from '../../../../../assets/icon/icon-mainflow/game.svg'
import { AlphabetTable } from './alphabet-table'
import { AlphabetGuideInfo } from './alphabet-guide-info'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import { GuideStrokes } from '../alphabet-drawing/GuideStrokes'
import { TypingPractice } from '../alphabet-typing/TypingPractice'

/** * AlphabetStudyMain: Nội dung chính của trang học chữ cái Hàn Quốc
 */
const PRACTICE_SENTENCES = [
  // 1-9: Câu gốc của bạn
  "안녕하세요 만나서 반가워요",
  "한국어 공부는 정말 재미있어요",
  "오늘 날씨가 아주 좋아요",
  "맛있는 음식을 먹고 싶어요",
  "저와 함께 한국어를 배워요",
  "배가 고파요 밥 먹으러 가요",
  "영화를 보고 싶어요 같이 갈래요",
  "지금 몇 시예요",
  "이것은 얼마예요",

  // 10-25: Chào hỏi & Cơ bản
  "이름이 무엇입니까",
  "저는 베트남 사람입니다",
  "다시 말해 주세요",
  "어떻게 지냈어요",
  "잘 지내고 있어요",
  "안녕히 계세요",
  "안녕히 가세요",
  "고맙습니다",
  "감사합니다",
  "실례합니다",
  "도와주세요",
  "괜찮아요",
  "알겠어요",
  "몰라요",
  "천천히 말씀해 주세요",
  "만나서 반가웠어요",

  // 26-45: Đời sống & Thói quen
  "오늘 뭐 해요",
  "지금 바빠요",
  "나중에 봐요",
  "숙제를 다 했어요",
  "일찍 일어났어요",
  "운동을 좋아해요",
  "피곤해요",
  "일하러 가요",
  "집에서 쉬고 싶어요",
  "잠을 자고 싶어요",
  "친구를 만나요",
  "음악을 들어요",
  "책을 읽고 있어요",
  "텔레비전을 봐요",
  "청소를 해요",
  "빨래를 해요",
  "요리를 해요",
  "산책하러 가요",
  "전화해 주세요",
  "기분이 좋아요",

  // 46-65: Ăn uống & Mua sắm
  "메뉴판 좀 주세요",
  "물 좀 주세요",
  "이거 매워요",
  "진짜 맛있어요",
  "계산해 주세요",
  "영수증 주세요",
  "너무 비싸요",
  "좀 깎아 주세요",
  "카드로 결제할 수 있어요",
  "봉투 필요하세요",
  "커피 한 잔 주세요",
  "배불러요",
  "예약하고 싶어요",
  "추천해 주세요",
  "쇼핑하러 가요",
  "백화점에 가요",
  "이것 좀 보여주세요",
  "입어봐도 돼요",
  "다른 거 없어요",
  "선물이에요",

  // 66-85: Thời gian & Thời tiết
  "내일 봐요",
  "어제 뭐 했어요",
  "비가 와요",
  "눈이 와요",
  "날씨가 더워요",
  "날씨가 추워요",
  "바람이 많이 불어요",
  "주말에 시간이 있어요",
  "몇 시에 만날까요",
  "벌써 밤이네요",
  "여름을 좋아해요",
  "겨울은 너무 추워요",
  "내일은 맑을 거예요",
  "태풍이 오고 있어요",
  "하늘이 예뻐요",
  "지금 어디예요",
  "빨리 오세요",
  "조금 늦을 거예요",
  "약속이 있어요",
  "시간이 없어요",

  // 86-100: Học tập & Công việc & Linh tinh
  "한국어를 공부하고 있어요",
  "시험이 어려워요",
  "질문이 있어요",
  "회의 중이에요",
  "퇴근하고 싶어요",
  "휴가 가고 싶어요",
  "연락드릴게요",
  "이메일 확인해 보세요",
  "열심히 하세요",
  "성공할 거예요",
  "생일 축하해요",
  "새해 복 많이 받으세요",
  "건강하세요",
  "잘 잤어요",
  "행운을 빌어요"
];

export function AlphabetStudyMain({
  modeTitle,
  current,
  currentIndex,
  isFlipped,
  isFavorite,
  data,
  favorites,
  onBackPress,
  onLearnPress,
  onPronunciationPress,
  onTypingPress,
  onDrawingPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onSelectFlashcard,
  onPrev,
  onNext,
  loading,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [strokeCount, setStrokeCount] = useState(0)
  const [strokeScores, setStrokeScores] = useState([])
  const [finalScore, setFinalScore] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [isSentenceMode, setIsSentenceMode] = useState(false)
  const [currentSentence, setCurrentSentence] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [strokeFeedbacks, setStrokeFeedbacks] = useState([])
  const [liveFeedback, setLiveFeedback] = useState('')
  const canvasRef = useRef(null)

  const selectedStrokes = current?.strokes || []
  const normalizedStrokes = selectedStrokes.map(s => s.hangulPoints)
  const guideData = selectedStrokes.map(s => s.guide)

  const handleSelectLetter = (index) => {
    onSelectFlashcard(index)
    setIsModalVisible(true)
    setIsDrawing(false)
    setIsTyping(false)
    setIsSentenceMode(false)
    resetDrawing()
  }

  const startSentenceTyping = () => {
    const randomIdx = Math.floor(Math.random() * PRACTICE_SENTENCES.length)
    setCurrentSentence(PRACTICE_SENTENCES[randomIdx])
    setIsSentenceMode(true)
    setIsTyping(false)
    setIsDrawing(false)
    setIsModalVisible(true)
  }

  const handleNextSentence = () => {
    const randomIdx = Math.floor(Math.random() * PRACTICE_SENTENCES.length)
    setCurrentSentence(PRACTICE_SENTENCES[randomIdx])
  }

  const resetDrawing = () => {
    setStrokeCount(0)
    setStrokeScores([])
    setFinalScore(null)
    setFeedbackMessage('')
    setStrokeFeedbacks([])
    setLiveFeedback('')
    canvasRef.current?.clearCanvas()
  }

  const handlePlaySound = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && current?.word) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(current.word)
      utterance.lang = 'ko-KR'
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleClear = () => {
    resetDrawing()
  }

  const handleUndo = () => {
    canvasRef.current?.undo()
    setStrokeCount(prev => Math.max(0, prev - 1))
    setStrokeScores(prev => prev.slice(0, -1))
    setFinalScore(null)
  }

  // Scoring helpers
  const getGeneralFeedback = (score) => {
    if (score >= 90) return "Tuyệt vời! Bạn đã nắm vững chữ này. 🎉"
    if (score >= 70) return "Rất tốt! Chỉ cần chú ý một chút nữa thôi. ✨"
    if (score >= 50) return "Khá tốt! Hãy luyện tập thêm để hoàn thiện nhé. 👍"
    return "Cố gắng lên! Hãy xem chi tiết lỗi bên dưới. 💪"
  }

  const pointToSegmentDistance = (p, a, b) => {
    const [px, py] = p
    const [ax, ay] = a
    const [bx, by] = b
    const vx = bx - ax
    const vy = by - ay
    const wx = px - ax
    const wy = py - ay
    const c1 = vx * wx + vy * wy
    if (c1 <= 0) return Math.hypot(px - ax, py - ay)
    const c2 = vx * vx + vy * vy
    if (c2 <= c1) return Math.hypot(px - bx, py - by)
    const t = c1 / c2
    return Math.hypot(px - (ax + t * vx), py - (ay + t * vy))
  }

  const distanceToPolyline = (point, polyline) => {
    if (!polyline || polyline.length === 0) return Infinity
    let minD = Infinity
    for (let i = 0; i < polyline.length - 1; i++) {
      const d = pointToSegmentDistance(point, polyline[i], polyline[i + 1])
      if (d < minD) minD = d
    }
    return minD
  }

  const handleStroke = (path, isEraser) => {
    if (isEraser || !current || !canvasSize.width || !canvasSize.height || !path || path.paths.length < 3) return

    const expectedStrokes = current.totalStrokes || selectedStrokes.length || 1
    if (finalScore !== null || strokeCount >= expectedStrokes) return

    const userPoints = path.paths.map(p => [p.x / canvasSize.width, p.y / canvasSize.height])
    const targetStroke = selectedStrokes[strokeCount]
    const targetPoints = targetStroke?.validationPoints || targetStroke?.hangulPoints || []

    if (!targetPoints.length || userPoints.length < 2) {
      setStrokeCount(prev => prev + 1)
      return
    }

    // 1. Kiểm tra độ bao phủ (Coverage) - Tỷ lệ điểm nằm trong vùng an toàn
    const tolerance = 0.08
    let insidePoints = 0
    userPoints.forEach(pt => {
      if (distanceToPolyline(pt, targetPoints) <= tolerance) insidePoints++
    })
    const coverageRatio = insidePoints / userPoints.length

    // 2. Kiểm tra điểm đầu và điểm cuối (Start/End Proximity)
    const startTarget = targetPoints[0]
    const endTarget = targetPoints[targetPoints.length - 1]
    const startUser = userPoints[0]
    const endUser = userPoints[userPoints.length - 1]

    const startDist = Math.hypot(startUser[0] - startTarget[0], startUser[1] - startTarget[1])
    const endDist = Math.hypot(endUser[0] - endTarget[0], endUser[1] - endTarget[1])
    
    // Chấp nhận trong khoảng 15% kích thước canvas
    const startEndScore = (startDist < 0.15 ? 0.5 : 0) + (endDist < 0.15 ? 0.5 : 0)

    // 3. Kiểm tra hướng vẽ (Direction Check)
    // Tính vector hướng của mẫu và người dùng
    const targetVec = [endTarget[0] - startTarget[0], endTarget[1] - startTarget[1]]
    const userVec = [endUser[0] - startUser[0], endUser[1] - startUser[1]]
    
    // Tính Dot Product để xem có cùng hướng không
    const dotProduct = targetVec[0] * userVec[0] + targetVec[1] * userVec[1]
    const isCorrectDirection = dotProduct > 0

    // Tính điểm tổng hợp (Weighted Score)
    // 60% Coverage + 20% Start/End + 20% Direction
    const percent = Math.min(100, Math.round((coverageRatio * 60) + (startEndScore * 20) + (isCorrectDirection ? 20 : 0)))
    
    // Tạo thông điệp phản hồi
    let message = ""
    let hasError = false
    if (!isCorrectDirection) {
      message = `Nét ${strokeCount + 1}: Vẽ ngược hướng!`
      hasError = true
    } else if (startDist >= 0.15) {
      message = `Nét ${strokeCount + 1}: Đặt bút chưa chuẩn.`
      hasError = true
    } else if (endDist >= 0.15) {
      message = `Nét ${strokeCount + 1}: Dừng bút chưa chuẩn.`
      hasError = true
    } else if (coverageRatio < 0.7) {
      message = `Nét ${strokeCount + 1}: Bị lệch nhiều quá.`
      hasError = true
    } else {
      message = `Nét ${strokeCount + 1}: Tốt!`
    }
    
    setLiveFeedback(message)
    const newFeedbacks = [...strokeFeedbacks, { strokeIndex: strokeCount, message, score: percent, hasError }]
    setStrokeFeedbacks(newFeedbacks)

    const newScores = [...strokeScores, percent]
    setStrokeScores(newScores)
    setStrokeCount(newScores.length)

    if (newScores.length === expectedStrokes) {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
      setFinalScore(avg)
      
      // Tìm lỗi đầu tiên để nhận xét tổng kết
      const firstError = newFeedbacks.find(f => f.hasError)
      if (firstError) {
        setFeedbackMessage(firstError.message)
      } else {
        setFeedbackMessage("Bạn vẽ rất tuyệt vời!")
      }
    }
  }

  const currentDetails = strokeFeedbacks

  useEffect(() => {
    if (isDrawing) {
      // In mobile we can estimate size or use a layout listener
      const screenWidth = Dimensions.get('window').width
      const modalWidth = Math.min(600, screenWidth * 0.95)
      const canvasWidth = modalWidth - 40 // padding
      setCanvasSize({ width: canvasWidth, height: canvasWidth })
    }
  }, [isDrawing])

  return (
    <View style={styles.container}>
      {/* Header with back and title */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        <Text style={styles.title}>BẢNG CHỮ CÁI</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <FlashcardActionButton title="Luyện gõ câu" icon={TypingIcon} onPress={startSentenceTyping} />
          <FlashcardActionButton title="Kiểm tra" icon={TestIcon} onPress={onTestPress} />
        </View>
      </View>

      {/* Alphabet Table view */}
      <View style={styles.tableContainer}>
        <AlphabetTable
          data={data}
          onSelectLetter={handleSelectLetter}
          loading={loading}
        />
        <AlphabetGuideInfo />
      </View>

      {/* Modal detail view */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            (isDrawing || isTyping || isSentenceMode) && styles.modalContentDrawing
          ]}>
            {!isDrawing && !isTyping && !isSentenceMode ? (
              <>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Đóng ✕</Text>
                </TouchableOpacity>

                {/* Display selected letter */}
                {current && (
                  <View style={styles.wordInfoContainer}>
                    <Text style={styles.koreanWord}>{current.word}</Text>
                    <TouchableOpacity onPress={handlePlaySound} style={styles.soundButton}>
                      <PronunciationIcon width={32} height={32} fill="#D32F2F" />
                    </TouchableOpacity>
                    {current.pronunciation || current.meaning ? (
                      <Text style={styles.meaningText}>{current.pronunciation || current.meaning}</Text>
                    ) : null}
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actions}>
                  <FlashcardActionButton title="Tập đánh chữ" icon={TypingIcon} onPress={() => setIsTyping(true)} />
                  <FlashcardActionButton title="Vẽ chữ" icon={DrawingIcon} onPress={() => setIsDrawing(true)} />
                </View>
              </>
            ) : isDrawing ? (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <View style={styles.drawingTitleAbsolute}>
                    <Text style={styles.drawingTitle}>Tập vẽ "{current?.word}"</Text>
                    <Text style={styles.strokeCountText}>Nét: {strokeCount}/{current?.totalStrokes || selectedStrokes.length || 1}</Text>
                  </View>
                  <View style={{ width: 40 }} />
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={[styles.canvasBox, finalScore !== null && styles.canvasBoxShrink]}>
                  {liveFeedback ? (
                    <View style={styles.liveFeedbackContainer}>
                      <Text style={styles.liveFeedbackText}>{liveFeedback}</Text>
                    </View>
                  ) : null}
                  {selectedStrokes.length > 0 && (
                    <GuideStrokes
                      strokes={normalizedStrokes}
                      guides={guideData}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      show={true}
                      activeStrokeIndex={strokeCount}
                      style={finalScore !== null ? { opacity: 0.4 } : {}}
                    />
                  )}
                  <ReactSketchCanvas
                    ref={canvasRef}
                    style={styles.canvas}
                    strokeWidth={15}
                    strokeColor="#4A4A4A"
                    canvasColor="transparent"
                    onStroke={handleStroke}
                  />

                  {finalScore !== null && (
                    <View style={styles.scoreSummary}>
                      <Text style={styles.scoreIconSmall}>🏆</Text>
                      <View>
                        <Text style={styles.scoreTextSmall}>Điểm: {finalScore}%</Text>
                        <Text style={styles.scoreFeedbackSmall}>{getGeneralFeedback(finalScore)}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.drawingActions}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.clearBtn, { width: '100%' }]} 
                    onPress={resetDrawing}
                  >
                    <Text style={styles.actionBtnText}>
                      {finalScore !== null ? 'Thử lại' : 'Xóa hết'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {finalScore !== null && strokeFeedbacks.length > 0 && (
                  <View style={styles.detailsSectionResult}>
                    <View style={styles.detailsHeader}>
                      <Text style={styles.detailsTitle}>Chi tiết từng nét</Text>
                    </View>
                    
                    <View style={styles.detailsListResult}>
                      {currentDetails.map((item, idx) => (
                        <View key={idx} style={styles.detailItemResult}>
                          <View style={[styles.detailStatus, { backgroundColor: item.hasError ? '#FFF1F0' : '#F6FFED' }]}>
                            <Text style={[styles.detailStatusText, { color: item.hasError ? '#FF4D4F' : '#52C41A' }]}>
                              {item.hasError ? '✘' : '✔'}
                            </Text>
                          </View>
                          <View style={styles.detailContent}>
                            <Text style={styles.detailLabel}>Nét {item.strokeIndex + 1}</Text>
                            <Text style={styles.detailMsg}>{item.message}</Text>
                          </View>
                          <Text style={styles.detailScore}>{item.score}%</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            ) : isTyping ? (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <View style={styles.drawingTitleAbsolute}>
                    <Text style={styles.drawingTitle}>Tập gõ "{current?.word}"</Text>
                  </View>
                  <View style={{ width: 40 }} /> {/* Spacer */}
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TypingPractice
                  targetWord={current?.word}
                  onComplete={() => {
                    // Could add a completion message or effect
                  }}
                />
              </View>
            ) : (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <View style={styles.drawingTitleAbsolute}>
                    <Text style={styles.drawingTitle}>Luyện gõ câu ngẫu nhiên</Text>
                  </View>
                  <View style={{ width: 40 }} /> {/* Spacer */}
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity 
                      style={[styles.backToDetailButton, { backgroundColor: '#4CAF50' }]}
                      onPress={handleNextSentence}
                    >
                      <Text style={[styles.backToDetailText, { color: '#fff' }]}>Câu tiếp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => { setIsModalVisible(false); setIsSentenceMode(false); }}
                    >
                      <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TypingPractice
                  targetWord={currentSentence}
                  onComplete={handleNextSentence}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
    flex: 1, // needed for ScrollView within Table to not get squashed
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D32F2F', // matching table header color
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 30,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentDrawing: {
    padding: 20,
    width: '98%',
    maxWidth: 800,
    height: '95%',
    justifyContent: 'flex-start',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 30,
    width: '100%',
  },
  wordInfoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  soundButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#FFF0F0',
  },
  koreanWord: {
    fontSize: 96,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  meaningText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  drawingContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 15,
  },
  drawingHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drawingTitleContainer: {
    alignItems: 'center',
  },
  drawingTitleAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  backToDetailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1BE4B',
    borderRadius: 10,
  },
  backToDetailText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#1A1A1A',
  },
  drawingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  strokeCountText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  canvasBox: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    zIndex: 2,
  },
  scoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  scoreIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  scoreFeedback: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 5,
  },
  drawingActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  drawingActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderRadius: 10,
  },
  drawingActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  clearBtn: {
    backgroundColor: '#FFF0F0',
  },
  liveFeedbackContainer: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  liveFeedbackText: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  detailsSection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pageBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageBtnDisabled: {
    opacity: 0.3,
  },
  pageBtnText: {
    fontSize: 10,
    color: '#1F2937',
  },
  pageIndicator: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailsList: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    gap: 10,
  },
  detailStatus: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
  },
  detailMsg: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailScore: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  canvasBoxShrink: {
    height: 180,
    opacity: 0.8,
  },
  scoreSummary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    zIndex: 30,
  },
  scoreIconSmall: {
    fontSize: 32,
  },
  scoreTextSmall: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  scoreFeedbackSmall: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    maxWidth: 160,
  },
  detailsSectionResult: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
  },
  detailsListResult: {
    gap: 6,
  },
  detailItemResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
})

