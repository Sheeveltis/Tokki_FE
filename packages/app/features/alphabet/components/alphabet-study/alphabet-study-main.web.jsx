import React, { useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { SoundOutlined, EditOutlined, HighlightOutlined, PlayCircleOutlined, DeleteOutlined, UndoOutlined, ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons'
import { FlashcardActionButton } from '../../../study/components/shared'
import { AlphabetTable } from './alphabet-table'
import { AlphabetGuideInfo } from './alphabet-guide-info'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import alphabetStrokesData from '../../api/alphabet-strokes.json'
import { GuideStrokes } from '../alphabet-drawing/GuideStrokes'
import { TypingPractice } from '../alphabet-typing/TypingPractice'

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
  const canvasRef = useRef(null)
  const canvasBoxRef = useRef(null)

  const selectedStrokeData = alphabetStrokesData.find(s => s.word === current?.word)
  const normalizedStrokes = selectedStrokeData?.strokes
    ? selectedStrokeData.strokes.map(s => s.hangulPoints)
    : []
  const guideData = selectedStrokeData?.strokes
    ? selectedStrokeData.strokes.map(s => s.guide)
    : []

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
    if (isEraser || !selectedStrokeData || !canvasSize.width || !canvasSize.height || !path || path.paths.length < 3) return
    
    const expectedStrokes = selectedStrokeData.totalStrokes || selectedStrokeData.strokes?.length || 1
    if (finalScore !== null || strokeCount >= expectedStrokes) return

    const userPoints = path.paths.map(p => [p.x / canvasSize.width, p.y / canvasSize.height])
    const targetStroke = selectedStrokeData.strokes[strokeCount]
    const targetPoints = targetStroke?.hangulPoints || []

    if (!targetPoints.length) {
      setStrokeCount(prev => prev + 1)
      return
    }

    const tolerance = 0.08
    let inside = 0
    userPoints.forEach(pt => {
      if (distanceToPolyline(pt, targetPoints) <= tolerance) inside++
    })

    const ratio = userPoints.length > 0 ? inside / userPoints.length : 0
    const percent = Math.max(0, Math.min(100, Math.round((ratio / 0.9) * 100)))

    const newScores = [...strokeScores, percent]
    setStrokeScores(newScores)
    setStrokeCount(newScores.length)

    if (newScores.length === expectedStrokes) {
      const avg = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length)
      setFinalScore(avg)
    }
  }

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
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        <Text style={styles.title}>BẢNG CHỮ CÁI TIẾNG HÀN</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <FlashcardActionButton title="Luyện gõ câu" icon={EditOutlined} onPress={startSentenceTyping} />
        </View>
      </View>

      {/* Alphabet Table view */}
      <View style={styles.tableContainer}>
        <AlphabetTable 
          data={data}
          onSelectLetter={handleSelectLetter}
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
                     <Text style={styles.meaningText}>{current.pronunciation || current.meaning}</Text>
                     <TouchableOpacity onPress={handlePlaySound} style={styles.soundButton}>
                       <SoundOutlined style={{ fontSize: 24, color: '#D32F2F' }} />
                     </TouchableOpacity>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actions}>
                  <FlashcardActionButton title="Tập đánh chữ" icon={EditOutlined} onPress={() => setIsTyping(true)} />
                  <FlashcardActionButton title="Vẽ chữ" icon={HighlightOutlined} onPress={() => setIsDrawing(true)} />
                </View>
              </>
            ) : isDrawing ? (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <TouchableOpacity style={styles.backToDetailButton} onPress={() => setIsDrawing(false)}>
                    <ArrowLeftOutlined />
                    <Text style={styles.backToDetailText}>Quay lại</Text>
                  </TouchableOpacity>
                  <View style={styles.drawingTitleContainer}>
                    <Text style={styles.drawingTitle}>Tập vẽ chữ "{current?.word}"</Text>
                    <Text style={styles.strokeCountText}>Nét: {strokeCount}/{selectedStrokeData?.totalStrokes || 1}</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.closeButton} 
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.canvasBox} ref={canvasBoxRef}>
                  {selectedStrokeData && (
                    <GuideStrokes
                      strokes={normalizedStrokes}
                      guides={guideData}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      show={true}
                    />
                  )}
                  <ReactSketchCanvas
                    ref={canvasRef}
                    style={styles.canvas}
                    strokeWidth={16}
                    strokeColor="#000"
                    canvasColor="transparent"
                    onStroke={handleStroke}
                  />
                  
                  {finalScore !== null && (
                    <View style={styles.scoreOverlay}>
                      <TrophyOutlined style={styles.scoreIcon} />
                      <Text style={styles.scoreText}>Điểm: {finalScore}%</Text>
                      <Text style={styles.scoreFeedback}>
                        {finalScore >= 80 ? 'Tuyệt vời!' : finalScore >= 50 ? 'Khá tốt!' : 'Cố gắng thêm nhé!'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.drawingActions}>
                  <TouchableOpacity style={styles.drawingActionButton} onPress={handleUndo}>
                    <UndoOutlined />
                    <Text>Hoàn tác</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawingActionButton, styles.clearBtn]} onPress={handleClear}>
                    <DeleteOutlined />
                    <Text>Xoá tất cả</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : isTyping ? (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <TouchableOpacity style={styles.backToDetailButton} onPress={() => setIsTyping(false)}>
                    <ArrowLeftOutlined />
                    <Text style={styles.backToDetailText}>Quay lại</Text>
                  </TouchableOpacity>
                  <View style={styles.drawingTitleContainer}>
                    <Text style={styles.drawingTitle}>Tập gõ chữ "{current?.word}"</Text>
                  </View>
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
                  <TouchableOpacity style={styles.backToDetailButton} onPress={() => { setIsModalVisible(false); setIsSentenceMode(false); }}>
                    <ArrowLeftOutlined />
                    <Text style={styles.backToDetailText}>Thoát</Text>
                  </TouchableOpacity>
                  <View style={styles.drawingTitleContainer}>
                    <Text style={styles.drawingTitle}>Luyện gõ câu ngẫu nhiên</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.backToDetailButton, { backgroundColor: '#4CAF50' }]}
                    onPress={handleNextSentence}
                  >
                    <Text style={[styles.backToDetailText, { color: '#fff' }]}>Câu tiếp</Text>
                  </TouchableOpacity>
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
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    aspectRatio: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderRadius: 16,
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
    flexDirection: 'row',
    gap: 16,
    width: '100%',
    justifyContent: 'center',
  },
  drawingActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f1f1f1',
    borderRadius: 12,
  },
  clearBtn: {
    backgroundColor: '#FFF0F0',
  },
})

