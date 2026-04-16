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
import alphabetStrokesData from '../../api/alphabet-strokes.json'
import { GuideStrokes } from '../alphabet-drawing/GuideStrokes'

/** * AlphabetStudyMain: Nội dung chính của trang học chữ cái Hàn Quốc
 */
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
  const [strokeCount, setStrokeCount] = useState(0)
  const [strokeScores, setStrokeScores] = useState([])
  const [finalScore, setFinalScore] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const canvasRef = useRef(null)
  
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
    resetDrawing()
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
        <FlashcardActionButton title="Kiểm tra" icon={TestIcon} onPress={onTestPress} />
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
          <View style={[styles.modalContent, isDrawing && styles.modalContentDrawing]}>
            {!isDrawing ? (
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
                  <FlashcardActionButton title="Tập đánh chữ" icon={TypingIcon} onPress={onTypingPress} />
                  <FlashcardActionButton title="Vẽ chữ" icon={DrawingIcon} onPress={() => setIsDrawing(true)} />
                </View>
              </>
            ) : (
              <View style={styles.drawingContainer}>
                <View style={styles.drawingHeader}>
                  <TouchableOpacity style={styles.backToDetailButton} onPress={() => setIsDrawing(false)}>
                    <ArrowIcon width={16} height={16} style={{ transform: [{ scaleX: -1 }] }} fill="#1A1A1A" />
                    <Text style={styles.backToDetailText}>Trở về</Text>
                  </TouchableOpacity>
                  <View style={styles.drawingTitleContainer}>
                    <Text style={styles.drawingTitle}>Tập vẽ "{current?.word}"</Text>
                    <Text style={styles.strokeCountText}>Nét: {strokeCount}/{selectedStrokeData?.totalStrokes || 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.canvasBox}>
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
                    strokeWidth={10}
                    strokeColor="#000"
                    canvasColor="transparent"
                    onStroke={handleStroke}
                  />
                  {finalScore !== null && (
                    <View style={styles.scoreOverlay}>
                      <Text style={styles.scoreIcon}>🏆</Text>
                      <Text style={styles.scoreText}>Điểm: {finalScore}%</Text>
                      <Text style={styles.scoreFeedback}>
                        {finalScore >= 80 ? 'Tuyệt vời!' : finalScore >= 50 ? 'Khá tốt!' : 'Cố gắng thêm nhé!'}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.drawingActions}>
                  <TouchableOpacity style={styles.drawingActionButton} onPress={handleUndo}>
                    <Text style={styles.drawingActionText}>Hoàn tác</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.drawingActionButton, styles.clearBtn]} onPress={handleClear}>
                    <Text style={[styles.drawingActionText, { color: '#D32F2F' }]}>Xoá hết</Text>
                  </TouchableOpacity>
                </View>
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
    width: '95%',
    maxWidth: 500,
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
})

