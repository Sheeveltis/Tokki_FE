import React, { useRef, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import BunnyHigh from '../../../../../assets/bunny/10.png'
import BunnyMedium from '../../../../../assets/bunny/7.png'
import BunnyLow from '../../../../../assets/bunny/9.png'
import BunnyVeryLow from '../../../../../assets/bunny/8.png'
import { useAlphabetDrawing } from '../../api/alphabet-drawing-logic'
import { PaginationControls } from '../../api/alphabet-typing-index'
import { GuideStrokes } from './GuideStrokes.web'
import { SampleCharacter } from './SampleCharacter.web'

/**
 * AlphabetDrawingMain (Web): Nội dung chính trang tập vẽ chữ cái Hàn Quốc
 * - Hiển thị chữ mẫu từ dữ liệu JSON
 * - Khung canvas để người dùng vẽ bằng chuột
 * - Hiển thị guide strokes để hướng dẫn vẽ
 */
export function AlphabetDrawingMain({ onBackPress }) {
  const canvasRef = useRef(null)
  const [strokeColor, setStrokeColor] = useState('#000000')
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })
  const [strokeCount, setStrokeCount] = useState(0)
  const [strokeScores, setStrokeScores] = useState([]) // điểm từng nét
  const [finalScore, setFinalScore] = useState(null) // điểm tổng khi đủ nét
  const [feedback, setFeedback] = useState('')
  const canvasBoxRef = useRef(null)

  const {
    current,
    currentIndex,
    total,
    showGuide,
    handleNext,
    handlePrev,
    toggleGuide,
  } = useAlphabetDrawing()

  // Chuyển dữ liệu từ JSON mới (strokes = [{ hangulPoints, guide }]) sang dạng dùng để vẽ
  const normalizedStrokes = current?.strokes
    ? current.strokes
        .filter((s) => s && Array.isArray(s.hangulPoints))
        .map((s) => s.hangulPoints)
    : []

  const guideData = current?.strokes
    ? current.strokes.map((s) => s?.guide || null)
    : []

  // Lấy kích thước canvas khi component mount
  useEffect(() => {
    if (canvasBoxRef.current) {
      const updateSize = () => {
        if (canvasBoxRef.current) {
          const rect = canvasBoxRef.current.getBoundingClientRect()
          setCanvasSize({ width: rect.width, height: rect.height })
        }
      }
      updateSize()
      window.addEventListener('resize', updateSize)
      return () => window.removeEventListener('resize', updateSize)
    }
  }, [])

  // Clear canvas khi chuyển chữ cái
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas()
    }
    setStrokeCount(0)
    setStrokeScores([])
    setFinalScore(null)
    setFeedback('')
  }, [currentIndex])

  const handleClear = () => {
    canvasRef.current?.clearCanvas()
    // Reset toàn bộ state chấm điểm để có thể vẽ lại từ đầu
    setStrokeCount(0)
    setStrokeScores([])
    setFinalScore(null)
    setFeedback('')
  }

  const handleUndo = () => {
    canvasRef.current?.undo()
    setStrokeCount((prev) => (prev > 0 ? prev - 1 : 0))
    setStrokeScores((prev) => prev.slice(0, Math.max(0, prev.length - 1)))
    setFinalScore(null)
    setFeedback('')
  }

  // Tính khoảng cách từ 1 điểm đến 1 đoạn thẳng (trên hệ toạ độ chuẩn hoá 0–1)
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
    const projX = ax + t * vx
    const projY = ay + t * vy
    return Math.hypot(px - projX, py - projY)
  }

  const distanceToPolyline = (point, polyline) => {
    if (!polyline || polyline.length === 0) return Infinity
    let minD = Infinity
    for (let i = 0; i < polyline.length - 1; i += 1) {
      const d = pointToSegmentDistance(point, polyline[i], polyline[i + 1])
      if (d < minD) minD = d
    }
    return minD
  }

  // Được gọi mỗi khi user kết thúc 1 stroke (pointer up)
  const handleStroke = (path, isEraser) => {
    if (!current || !canvasSize.width || !canvasSize.height || !path) {
      return
    }

    // Nếu sau này có chế độ tẩy thì bỏ qua chấm điểm
    if (isEraser) return

    // Bỏ qua những "click nhẹ" hoặc nét quá ngắn (user chỉ chấm 1 điểm)
    if (!Array.isArray(path.paths) || path.paths.length < 3) {
      return
    }
    const xs = path.paths.map((p) => p.x)
    const ys = path.paths.map((p) => p.y)
    const spanX = Math.max(...xs) - Math.min(...xs)
    const spanY = Math.max(...ys) - Math.min(...ys)
    const minSpanPx = 10 // tối thiểu phải kéo > 10px theo 1 trong 2 trục mới tính là 1 nét
    if (spanX < minSpanPx && spanY < minSpanPx) {
      return
    }

    const expectedStrokes = current.totalStrokes ?? current.strokes?.length ?? 1

    // Nếu đã có điểm tổng (đã hoàn thành) thì không chấm điểm nữa
    // Cho phép vẽ lại từ đầu sau khi reset
    if (finalScore !== null) {
      return
    }

    // Nếu đã đủ số nét chuẩn thì vẫn cho vẽ tiếp nhưng KHÔNG chấm điểm nữa
    if (strokeCount >= expectedStrokes) {
      return
    }

    // Chuẩn hoá toạ độ nét vẽ user về [0,1]
    const userPoints = path.paths.map((p) => [
      p.x / canvasSize.width,
      p.y / canvasSize.height,
    ])

    // Lấy nét mẫu tương ứng với thứ tự hiện tại
    const targetStroke =
      current.strokes?.find(
        (s) => s.order === strokeCount + 1 && s.isMainStroke && Array.isArray(s.hangulPoints),
      ) ||
      (current.strokes && current.strokes[strokeCount])

    const targetPoints = targetStroke?.hangulPoints || []
    if (!targetPoints.length) {
      setStrokeCount((prev) => prev + 1)
      setFeedback('')
      return
    }

    // Tính % điểm user nằm trong vùng gần polyline mẫu
    const tolerance = 0.08 // 8% kích thước khung, có thể tinh chỉnh
    let inside = 0
    userPoints.forEach((pt) => {
      const d = distanceToPolyline(pt, targetPoints)
      if (d <= tolerance) {
        inside += 1
      }
    })

    const ratio = userPoints.length > 0 ? inside / userPoints.length : 0
    // Muốn 100 điểm khi “phủ kín” ~90%: scale theo ngưỡng 0.9
    const percent = Math.max(
      0,
      Math.min(100, Math.round((ratio / 0.9) * 100)),
    )

    const newScores = [...strokeScores, percent]
    const newCount = newScores.length
    setStrokeScores(newScores)
    setStrokeCount(newCount)

    if (newCount === expectedStrokes) {
      const avg =
        newScores.length > 0
          ? Math.round(newScores.reduce((sum, v) => sum + v, 0) / newScores.length)
          : 0
      setFinalScore(avg)
      if (avg >= 80) {
        setFeedback(`Tuyệt vời! Bạn hoàn thành chữ này với khoảng ${avg}% chính xác.`)
      } else if (avg >= 50) {
        setFeedback(`Tạm ổn, điểm tổng khoảng ${avg}%. Hãy thử lại để viết mượt hơn nhé.`)
      } else {
        setFeedback(`Điểm tổng chỉ khoảng ${avg}%. Thử lại và bám sát đường xám hơn nhé.`)
      }
    } else {
      // Feedback cho từng nét trong quá trình vẽ
      if (percent >= 80) {
        setFeedback(`Rất tốt! Nét ${newCount} khoảng ${percent}%. Tiếp tục nét tiếp theo nhé.`)
      } else if (percent >= 50) {
        setFeedback(
          `Nét ${newCount} ~${percent}%. Ổn nhưng có thể bám sát đường xám hơn ở nét sau.`,
        )
      } else {
        setFeedback(
          `Nét ${newCount} hơi lệch (chỉ ~${percent}%). Hãy chú ý hướng mũi tên cho nét tiếp theo.`,
        )
      }
    }
  }

  const getResultVisual = (score) => {
    if (score == null) return null
    if (score >= 85) {
      return {
        image: BunnyHigh,
        title: 'Xuất sắc!',
        message: 'Bạn viết rất đúng nét, tiếp tục phát huy nhé!',
      }
    }
    if (score >= 65) {
      return {
        image: BunnyMedium,
        title: 'Khá tốt!',
        message: 'Đã đúng khá nhiều rồi, luyện thêm chút sẽ hoàn hảo.',
      }
    }
    if (score >= 45) {
      return {
        image: BunnyLow,
        title: 'Cần luyện thêm',
        message: 'Bạn đã nắm được hướng nét, thử lại để mượt hơn nhé.',
      }
    }
    return {
      image: BunnyVeryLow,
      title: 'Đừng nản!',
      message: 'Chưa đúng lắm, nhưng cứ thử lại vài lần là quen ngay.',
    }
  }


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />

        <Text style={styles.title}>Tập vẽ chữ cái Hàn Quốc</Text>
      </View>

      {/* Khu vực chữ mẫu + hướng dẫn */}
      {current && (
        <View style={styles.sampleWrapper}>
        <View style={styles.sampleBox}>
          <Text style={styles.sampleLabel}>Chữ cần vẽ</Text>
          <View style={styles.sampleCharContainer}>
            <SampleCharacter
              strokes={normalizedStrokes}
              width={120}
              height={120}
            />
          </View>
          <Text style={styles.samplePronunciation}>[{current.pronunciation}]</Text>
          <Text style={styles.sampleMeaning}>{current.meaning}</Text>
        </View>

          <View style={styles.guideBox}>
            <Text style={styles.guideTitle}>Hướng dẫn</Text>
            <Text style={styles.guideText}>
              {current.description || 'Vẽ theo thứ tự nét được hiển thị trên canvas.'}
            </Text>
            <Text style={styles.guideText}>
              {'\n'}Số nét: {current.strokes.length}
            </Text>
          </View>
        </View>
      )}

      {/* Canvas vẽ chữ */}
      <View style={styles.canvasWrapper}>
        <View style={styles.canvasHeader}>
          <Text style={styles.canvasLabel}>Khung vẽ</Text>
          <TouchableOpacity style={styles.toggleGuideButton} onPress={toggleGuide}>
            <Text style={styles.toggleGuideText}>
              {showGuide ? 'Ẩn hướng dẫn' : 'Hiện hướng dẫn'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.canvasBox} ref={canvasBoxRef}>
          {current && (
            <GuideStrokes
              strokes={normalizedStrokes}
              guides={guideData}
              width={canvasSize.width}
              height={canvasSize.height}
              show={showGuide}
            />
          )}
          <ReactSketchCanvas
            ref={canvasRef}
            style={styles.canvas}
            strokeWidth={12}
            strokeColor={strokeColor}
            canvasColor="transparent"
            withTimestamp={false}
            onStroke={handleStroke}
          />
        </View>

        {/* Kết quả và feedback (khi đang trong quá trình vẽ, chưa đủ nét) */}
        {current && finalScore === null && (
          <View style={styles.scoreBox}>
            <Text style={styles.scoreText}>
              {strokeScores.length > 0
                ? `Độ chính xác nét ${strokeScores.length}: ${
                    strokeScores[strokeScores.length - 1]
                  }%  (${strokeScores.length}/${
                    current.totalStrokes ?? current.strokes?.length ?? 1
                  } nét)`
                : `Hãy vẽ lần lượt ${
                    current.totalStrokes ?? current.strokes?.length ?? 1
                  } nét theo hướng dẫn.`}
            </Text>
            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <View style={styles.leftActions}>
            <TouchableOpacity style={[styles.actionButton, styles.clearButton]} onPress={handleClear}>
              <Text style={styles.actionText}>Xoá hết</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleUndo}>
              <Text style={styles.actionText}>Hoàn tác</Text>
            </TouchableOpacity>
          </View>

          {/* Chọn màu nét vẽ đơn giản */}
          <View style={styles.colorPickerRow}>
            {['#000000', '#FF4B4B', '#3B82F6', '#22C55E'].map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  strokeColor === color && styles.colorDotActive,
                ]}
                onPress={() => setStrokeColor(color)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Pagination */}
      {current && (
        <PaginationControls
          currentIndex={currentIndex}
          total={total}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {/* Modal kết quả tổng + bunny */}
      {finalScore !== null && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultModal}>
            {(() => {
              const info = getResultVisual(finalScore)
              return (
                <>
                  <Image source={info.image} style={styles.bunnyImage} resizeMode="contain" />
                  <Text style={styles.resultTitle}>{info.title}</Text>
                  <Text style={styles.resultScoreText}>Điểm của bạn: {finalScore}%</Text>
                  <Text style={styles.resultMessage}>
                    {feedback || info.message}
                  </Text>
                </>
              )
            })()}

            <View style={styles.resultButtonsRow}>
              <TouchableOpacity
                style={[styles.resultButton, styles.resultButtonSecondary]}
                onPress={handleClear}
              >
                <Text style={styles.resultButtonText}>Thử lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.resultButton, styles.resultButtonPrimary]}
                onPress={handleNext}
              >
                <Text style={[styles.resultButtonText, styles.resultButtonPrimaryText]}>
                  Tiếp theo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 24,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
  },
  sampleWrapper: {
    width: '100%',
    flexDirection: 'row',
    gap: 16,
  },
  sampleBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  sampleLabel: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 8,
  },
  sampleCharContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  samplePronunciation: {
    marginTop: 4,
    fontSize: 16,
    color: '#333333',
  },
  sampleMeaning: {
    marginTop: 4,
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  guideBox: {
    flex: 1.4,
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#F1BE4B',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1F1F1F',
  },
  guideText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  canvasWrapper: {
    width: '100%',
    gap: 12,
  },
  canvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  canvasLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  toggleGuideButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#E0E0E0',
  },
  toggleGuideText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  canvasBox: {
    width: '100%',
    maxWidth: 450,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D4D4D8',
    position: 'relative',
    alignSelf: 'center',
  },
  canvas: {
    flex: 1,
  },
  actionsRow: {
    marginTop: 8,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#F1BE4B',
  },
  clearButton: {
    backgroundColor: '#FF9F9F',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F1F1F',
  },
  colorPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotActive: {
    borderColor: '#1F2937',
  },
  scoreBox: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  feedbackText: {
    marginTop: 4,
    fontSize: 13,
    color: '#4B5563',
  },
  resultOverlay: {
    position: 'fixed',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 9999,
  },
  resultModal: {
    width: 360,
    maxWidth: '90%',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  bunnyImage: {
    width: 180,
    height: 140,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  resultScoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  resultMessage: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 10,
  },
  resultButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5F5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  resultButtonSecondary: {
    backgroundColor: '#FFFFFF',
  },
  resultButtonPrimary: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  resultButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  resultButtonPrimaryText: {
    color: '#FFFFFF',
  },
})




