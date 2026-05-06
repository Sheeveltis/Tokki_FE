import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import {
  SoundOutlined,
  EditOutlined,
  HighlightOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
  UndoOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  CloseOutlined
} from '@ant-design/icons'
import { FlashcardActionButton } from '../../../study/components/shared'
import { AlphabetTable } from './alphabet-table'
import { AlphabetGuideInfo } from './alphabet-guide-info'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import { GuideStrokes } from '../alphabet-drawing/GuideStrokes'
import { TypingPractice } from '../alphabet-typing/TypingPractice'
import ButtonUI from 'components/decor/buttonUI'
import ButtonUI2 from 'components/decor/buttonUI2'

/**
 * CloseButton: Nút X với hiệu ứng hover, đồng bộ với phong cách client
 */
const CloseButton = ({ onPress, style }) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
      style={[
        styles.closeButton,
        isHovered && styles.closeButtonHover,
        style
      ]}
    >
      <Text style={[
        styles.closeButtonIcon,
        isHovered && styles.closeButtonIconHover
      ]}>✕</Text>
    </TouchableOpacity>
  )
}

/**
 * AlphabetStudyMain (Web): Nội dung chính của trang học chữ cái Hàn Quốc trên web
 */
const PRACTICE_SENTENCES = [
  "안녕하세요 만나서 반가워요",
  "한국어 공부는 정말 재미있어요",
  "오늘 날씨가 아주 좋아요",
  "맛있는 음식을 먹고 싶어요",
  "저와 함께 한국어를 배워요",
  "배가 고파요 밥 먹으러 가요",
  "영화를 보고 싶어요 같이 갈래요",
  "지금 몇 시예요",
  "이것은 얼마예요",
  "이름이 무엇입니까",
  "저는 베트남 사람입니다",
  "다시 말해 주세요",
  "어떻게 지냈어요",
  "잘 지내고 있어요",
  "안녕히 계세요",
  "안녕히 가세요"
]

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
  const [detailsPage, setDetailsPage] = useState(0)
  const canvasRef = useRef(null)
  const canvasBoxRef = useRef(null)
  const audioRef = useRef(null)

  const selectedStrokes = current?.strokes || []
  const normalizedStrokes = selectedStrokes.map(s => s.hangulPoints)
  const guideData = selectedStrokes.map(s => s.guide)

  const handlePlaySound = (customAudio) => {
    // Ensure customAudio is a string URL, otherwise fallback to current?.audio
    const audioUrl = typeof customAudio === 'string' ? customAudio : current?.audio;
    
    const playSpeechFallback = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && current?.word) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(current.word);
        utterance.lang = 'ko-KR';
        window.speechSynthesis.speak(utterance);
      }
    };

    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.play().catch(e => {
        console.warn('Audio play failed, using fallback:', e);
        playSpeechFallback();
      });
    } else {
      playSpeechFallback();
    }
  };

  const handleSelectLetter = (index) => {
    onSelectFlashcard(index);
    const selectedItem = data[index];
    if (selectedItem?.audio) {
      handlePlaySound(selectedItem.audio);
    }
    setIsModalVisible(true);
    setIsDrawing(false);
    setIsTyping(false);
    setIsSentenceMode(false);
    resetDrawing();
  };

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
    setDetailsPage(0)
    canvasRef.current?.clearCanvas()
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

    // 1. Kiểm tra độ bao phủ (Coverage)
    const tolerance = 0.08
    let insidePoints = 0
    userPoints.forEach(pt => {
      if (distanceToPolyline(pt, targetPoints) <= tolerance) insidePoints++
    })
    const coverageRatio = insidePoints / userPoints.length

    // 2. Kiểm tra điểm đầu và điểm cuối
    const startTarget = targetPoints[0]
    const endTarget = targetPoints[targetPoints.length - 1]
    const startUser = userPoints[0]
    const endUser = userPoints[userPoints.length - 1]

    const startDist = Math.hypot(startUser[0] - startTarget[0], startUser[1] - startTarget[1])
    const endDist = Math.hypot(endUser[0] - endTarget[0], endUser[1] - endTarget[1])
    const startEndScore = (startDist < 0.15 ? 0.5 : 0) + (endDist < 0.15 ? 0.5 : 0)

    // 3. Kiểm tra hướng vẽ
    const targetVec = [endTarget[0] - startTarget[0], endTarget[1] - startTarget[1]]
    const userVec = [endUser[0] - startUser[0], endUser[1] - startUser[1]]
    const dotProduct = targetVec[0] * userVec[0] + targetVec[1] * userVec[1]
    const isCorrectDirection = dotProduct > 0

    // Tính điểm tổng hợp (Weighted Score)
    // 60% Coverage + 20% Start/End + 20% Direction
    const strokeScore = (coverageRatio * 60) + (startEndScore * 20) + (isCorrectDirection ? 20 : 0)
    const percent = Math.max(0, Math.min(100, Math.round(strokeScore)))
    
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

  const itemsPerPage = 3
  const totalPages = Math.ceil(strokeFeedbacks.length / itemsPerPage)
  const currentDetails = strokeFeedbacks.slice(detailsPage * itemsPerPage, (detailsPage + 1) * itemsPerPage)

  useEffect(() => {
    if (isDrawing && canvasBoxRef.current) {
      const updateSize = () => {
        const rect = canvasBoxRef.current?.getBoundingClientRect()
        if (rect) setCanvasSize({ width: rect.width, height: rect.height })
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [isDrawing])

  return (
    <View style={styles.container}>
      {/* Header with back and title */}
      <View style={styles.header}>
        <View style={styles.titleAbsolute}>
          <Text style={styles.title}>BẢNG CHỮ CÁI TIẾNG HÀN</Text>
        </View>
        <NavigationPill
          label="Quay lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <ButtonUI2 onClick={startSentenceTyping}>
            Luyện gõ câu
          </ButtonUI2>
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
                <CloseButton
                  style={styles.modalCloseIcon}
                  onPress={() => setIsModalVisible(false)}
                />

                {/* Display selected letter */}
                {current && (
                  <View style={styles.wordInfoContainer}>
                    <Text style={styles.koreanWord}>{current.word}</Text>
                    <Text style={styles.meaningText}>{current.pronunciation || current.meaning}</Text>
                    <TouchableOpacity onPress={handlePlaySound} style={styles.soundButton}>
                      <SoundOutlined style={{ fontSize: 24, color: '#D32F2F' }} />
                    </TouchableOpacity>
                  </View>
                )}

                {/* Action buttons */}
                <View style={[styles.actions, { alignItems: 'center' }]}>
                  <ButtonUI2 onClick={() => setIsTyping(true)} style={{ transform: [{ scale: 0.8 }] }}>
                    Tập đánh chữ
                  </ButtonUI2>
                  <ButtonUI onClick={() => setIsDrawing(true)} type="C">
                    Vẽ chữ
                  </ButtonUI>
                </View>
              </>
            ) : isDrawing ? (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <View style={styles.drawingTitleAbsolute}>
                    <Text style={styles.drawingTitle}>Tập vẽ chữ "{current?.word}"</Text>
                    <Text style={styles.strokeCountText}>Nét: {strokeCount}/{current?.totalStrokes || selectedStrokes.length || 1}</Text>
                  </View>
                  <View style={{ width: 40 }} /> {/* Left spacer */}
                  <CloseButton
                    onPress={() => setIsModalVisible(false)}
                  />
                </View>

                <View style={[styles.canvasBox, finalScore !== null && styles.canvasBoxShrink]} ref={canvasBoxRef}>
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
                      style={finalScore !== null ? { opacity: 0.5 } : {}}
                    />
                  )}
                  <ReactSketchCanvas
                    ref={canvasRef}
                    style={styles.canvas}
                    strokeWidth={12}
                    strokeColor="#000"
                    canvasColor="transparent"
                    onStroke={handleStroke}
                  />

                  {finalScore !== null && (
                    <View style={styles.scoreSummary}>
                      <TrophyOutlined style={styles.scoreIconSmall} />
                      <View>
                        <Text style={styles.scoreTextSmall}>Điểm: {finalScore}%</Text>
                        <Text style={styles.scoreFeedbackSmall}>{getGeneralFeedback(finalScore)}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={[styles.drawingActions, finalScore !== null && styles.drawingActionsResult]}>
                  <TouchableOpacity style={styles.tryAgainButton} onPress={handleClear}>
                    <UndoOutlined style={{ fontSize: 20 }} />
                    <Text style={styles.tryAgainText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>

                {finalScore !== null && strokeFeedbacks.length > 0 && (
                  <View style={styles.detailsSectionResult}>
                    <View style={styles.detailsHeader}>
                      <Text style={styles.detailsTitle}>Chi tiết từng nét</Text>
                      {totalPages > 1 && (
                        <View style={styles.pagination}>
                          <TouchableOpacity 
                            disabled={detailsPage === 0}
                            onClick={() => setDetailsPage(p => p - 1)}
                            style={[styles.pageBtn, detailsPage === 0 && styles.pageBtnDisabled]}
                          >
                            <ArrowLeftOutlined />
                          </TouchableOpacity>
                          <Text style={styles.pageIndicator}>{detailsPage + 1}/{totalPages}</Text>
                          <TouchableOpacity 
                            disabled={detailsPage === totalPages - 1}
                            onClick={() => setDetailsPage(p => p + 1)}
                            style={[styles.pageBtn, detailsPage === totalPages - 1 && styles.pageBtnDisabled]}
                          >
                            <ArrowLeftOutlined style={{ transform: [{ scaleX: -1 }] }} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.detailsListResult}>
                      {currentDetails.map((item, idx) => (
                        <View key={idx} style={styles.detailItemResult}>
                          <View style={[styles.detailStatus, { backgroundColor: item.hasError ? '#FFF1F0' : '#F6FFED' }]}>
                            {item.hasError ? 
                              <CloseOutlined style={{ color: '#FF4D4F' }} /> : 
                              <HighlightOutlined style={{ color: '#52C41A' }} />
                            }
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
                    <Text style={styles.drawingTitle}>Tập gõ chữ "{current?.word}"</Text>
                  </View>
                  <View style={{ width: 40 }} /> {/* Left spacer */}
                  <CloseButton
                    onPress={() => setIsModalVisible(false)}
                  />
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
                  <View style={{ width: 40 }} /> {/* Left spacer */}
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                    <TouchableOpacity
                      style={[styles.backToDetailButton, { backgroundColor: '#4CAF50' }]}
                      onPress={handleNextSentence}
                    >
                      <Text style={[styles.backToDetailText, { color: '#fff' }]}>Câu tiếp</Text>
                    </TouchableOpacity>
                    <CloseButton
                      onPress={() => { setIsModalVisible(false); setIsSentenceMode(false); }}
                    />
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
    gap: 32,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    minHeight: 60,
  },
  titleAbsolute: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: -1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D32F2F', // match table title style
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
    gap: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalContentDrawing: {
    padding: 24,
    width: '98%',
    maxWidth: 900,
    height: '98%',
    justifyContent: 'flex-start',
    overflow: 'auto', // for web scrolling
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }),
  },
  closeButtonHover: {
    backgroundColor: '#FFEBEE',
  },
  closeButtonIcon: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
  closeButtonIconHover: {
    color: '#F44336',
  },
  modalCloseIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  wordInfoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
    minWidth: 200,
    paddingHorizontal: 60,
  },
  soundButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
  },
  koreanWord: {
    fontSize: 120,
    fontWeight: '900',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  meaningText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
  drawingContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
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
    gap: 8,
    padding: 10,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
  },
  backToDetailText: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  drawingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  strokeCountText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  canvasBox: {
    width: '100%',
    maxWidth: 600,
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#eee',
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
  },
  liveFeedbackContainer: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    pointerEvents: 'none',
  },
  liveFeedbackText: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 25,
    fontSize: 14,
    fontWeight: '700',
  },
  scoreIcon: {
    fontSize: 48,
    color: '#F1BE4B',
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  scoreFeedback: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 5,
  },
  drawingActions: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  drawingActionsResult: {
    paddingVertical: 10,
  },
  tryAgainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#F1BE4B',
    borderRadius: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    cursor: 'pointer',
  },
  tryAgainText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  detailsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    width: '100%',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pageBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  pageBtnDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  pageIndicator: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailsList: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    gap: 12,
  },
  detailStatus: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  detailMsg: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  detailScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  canvasBoxShrink: {
    aspectRatio: 1.8,
    opacity: 0.8,
    marginBottom: 0,
  },
  scoreSummary: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    zIndex: 30,
  },
  scoreIconSmall: {
    fontSize: 40,
    color: '#F1BE4B',
  },
  scoreTextSmall: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  scoreFeedbackSmall: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    maxWidth: 200,
  },
  drawingActionsResult: {
    paddingVertical: 10,
  },
  detailsSectionResult: {
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
    padding: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
})
