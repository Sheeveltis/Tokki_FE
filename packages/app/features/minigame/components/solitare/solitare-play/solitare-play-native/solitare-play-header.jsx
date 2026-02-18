import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { normalizeImageSource } from '../../../../../study/api'

import CarrotImage from '../../../../../../../assets/carrot.png'

/**
 * Header cho minigame Solitaire
 * - Bên trái: bộ đếm thời gian
 * - Giữa: tiêu đề "Solitaire"
 * - Bên phải: điểm hiện tại + icon cà rốt
 *
 * Props được giữ gần giống MatchingCardHeader để sau này dễ tái sử dụng:
 * @param {{
 *  initialSeconds?: number
 *  score?: number
 *  onTimeUp?: () => void
 *  onTick?: (seconds: number) => void
 *  staticMode?: boolean
 * }} props
 */
export function SolitarePlayHeader({
  initialSeconds = 600,
  score = 0,
  onTimeUp,
  onTick,
  staticMode = false,
}) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const timerRef = useRef(null)
  const onTimeUpRef = useRef(onTimeUp)
  const onTickRef = useRef(onTick)

  useEffect(() => {
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  useEffect(() => {
    setSeconds(initialSeconds)
    if (typeof onTickRef.current === 'function') {
      onTickRef.current(initialSeconds)
    }

    if (timerRef.current) clearInterval(timerRef.current)

    if (staticMode) {
      // Không chạy interval trong chế độ static (ví dụ trang result)
      return
    }

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        const next = prev <= 1 ? 0 : prev - 1
        if (typeof onTickRef.current === 'function') {
          onTickRef.current(next)
        }

        if (next === 0) {
          clearInterval(timerRef.current)
          timerRef.current = null
          if (typeof onTimeUpRef.current === 'function') onTimeUpRef.current()
        }

        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [initialSeconds, staticMode])

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [seconds])

  return (
    <View style={styles.container}>
      <View style={styles.timeBox}>
        <Text style={styles.label}>{formattedTime}</Text>
      </View>

      <View style={styles.titleBox}>
        <Text style={styles.titleText}>Solitaire</Text>
      </View>

      <View style={styles.scoreBox}>
        <Text style={styles.label}>{score} Điểm</Text>
        <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} resizeMode="contain" />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 10,
    backgroundColor: '#F5F0DD',
    borderRadius: 12,
  },
  timeBox: {
    minWidth: 100,
  },
  titleBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
    justifyContent: 'flex-end',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  carrot: {
    width: 28,
    height: 28,
  },
})

export default SolitarePlayHeader


