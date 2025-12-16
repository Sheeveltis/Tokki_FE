import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
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
 * }} props
 */
export function MatchingCardHeader({
  topicId = 'life',
  topicName,
  initialSeconds = 600,
  score = 0,
  onTimeUp,
  onFinish,
}) {
  const [seconds, setSeconds] = useState(initialSeconds)
  const timerRef = useRef(null)

  const displayTopic = useMemo(() => topicName || TOPIC_NAMES[topicId] || 'Minigame', [topicId, topicName])

  useEffect(() => {
    setSeconds(initialSeconds)
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          timerRef.current = null
          if (typeof onTimeUp === 'function') onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [initialSeconds, onTimeUp])

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
        <FinishButton onPress={onFinish} />
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
})
