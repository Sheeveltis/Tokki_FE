import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import GameCardIcon from '../../../../../../assets/icon/icon-mainflow/game-card.svg'
import CarrotImage from '../../../../../../assets/carrot.png'
import { FinishButton } from './finishbtn'

const TOPIC_NAMES = {
  hobby: '취미',
  family: '가족',
  job: '직업',
  school: '학교',
  life: '생활',
  sport: '스포츠',
}

/**
 * Header for matching card minigame
 * @param {{
 *  topicId?: string
 *  topicName?: string
 *  initialSeconds?: number
 *  score?: number
 *  onTimeUp?: () => void
 *  onFinish?: () => void
 *  onBack?: () => void
 *  onTick?: (seconds: number) => void
 *  staticMode?: boolean
 *  showControls?: boolean
 * }} props
 */
export function MatchingCardHeader({
  topicId = 'life',
  topicName,
  initialSeconds = 600,
  score = 0,
  onTimeUp,
  onFinish,
  onBack,
  onTick,
  staticMode = false,
  showControls = true,
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

  const displayTopic = useMemo(() => topicName || TOPIC_NAMES[topicId] || 'Minigame', [topicId, topicName])

  useEffect(() => {
    setSeconds(initialSeconds)
    if (typeof onTickRef.current === 'function') {
      onTickRef.current(initialSeconds)
    }

    if (timerRef.current) clearInterval(timerRef.current)

    if (staticMode) {
      // Không chạy interval trong chế độ static (trang result)
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

      <View style={styles.topicBox}>
        <Image source={normalizeImageSource(GameCardIcon)} style={styles.icon} resizeMode="contain" />
        <Text style={styles.topicText}>{displayTopic}</Text>
      </View>

      <View style={styles.scoreBox}>
        <Text style={styles.label}>{score} Điểm</Text>
        <Image source={normalizeImageSource(CarrotImage)} style={styles.carrot} resizeMode="contain" />
        {showControls && (
          <>
            {typeof onBack === 'function' && (
              <Pressable onPress={onBack} style={styles.backBtn}>
                <Text style={styles.backText}>Quay lại</Text>
              </Pressable>
            )}
            <FinishButton onPress={onFinish} />
          </>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F5F0DD',
    borderRadius: 12,
  },
  timeBox: {
    minWidth: 80,
    right: 100,
  },
  topicBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 80,
    justifyContent: 'flex-end',
    left: 100,
  },
  label: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  topicText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  icon: {
    width: 28,
    height: 28,
  },
  carrot: {
    width: 28,
    height: 28,
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#CCCCCC',
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1C',
  },
})
