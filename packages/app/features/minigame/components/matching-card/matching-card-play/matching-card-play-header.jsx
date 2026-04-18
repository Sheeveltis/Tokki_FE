import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import { normalizeImageSource } from '../../../../study/api'

import GameCardIcon from '../../../../../../assets/icon/icon-mainflow/game-card.svg'
import CarrotImage from '../../../../../../assets/carrot.png'
import ButtonWood from '../../../../../../assets/ButtonWood.png'
import AlarmIcon from '../../../../../../assets/icon/icon-mainflow/alarm.svg'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import TitleBadge from '../../../../../../assets/TitleBadge.png'
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
 *  onToggleSound?: () => void
 *  isMuted?: boolean
 *  onMenu?: () => void
 *  onGuide?: () => void
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
  onToggleSound,
  isMuted = false,
  onMenu,
  onGuide,
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
    onTimeUpRef.current = onTimeUp
  }, [onTimeUp])

  useEffect(() => {
    onTickRef.current = onTick
  }, [onTick])

  // Chỉ reset khi initialSeconds đổi thật sự
  useEffect(() => {
    setSeconds(initialSeconds)
    if (typeof onTickRef.current === 'function') {
      onTickRef.current(initialSeconds)
    }
  }, [initialSeconds])

  // Chỉ pause / resume timer, không reset seconds
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (staticMode) {
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
          if (typeof onTimeUpRef.current === 'function') {
            onTimeUpRef.current()
          }
        }

        return next
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [staticMode])

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }, [seconds])

  return (
    <View style={styles.headerWrapper}>
      {/* Left: Back Button */}
      <View style={styles.leftSection}>
        {typeof onBack === 'function' && (
          <Pressable onPress={onBack} style={styles.backButtonContainer}>
            <Image source={normalizeImageSource(ButtonWood)} style={styles.backButtonBg} />
            <View style={styles.backButtonContent}>
              <ArrowIcon width={18} height={18} fill="#FFD700" style={styles.backArrow} />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </View>
          </Pressable>
        )}
      </View>

      {/* Center: Main Header Elements */}
      <View style={styles.centerSection}>
        <View style={styles.timeBox} nativeID="matching-card-timer">
          <View style={styles.timeContent}>
            <AlarmIcon width={24} height={24} fill="#FF4D4D" />
            <Text style={styles.label}>{formattedTime}</Text>
          </View>
        </View>

        <View style={styles.topicBox} nativeID="matching-card-topic">
          <Image source={normalizeImageSource(TitleBadge)} style={styles.topicBg} />
          <View style={styles.topicContent}>
            <Text style={styles.topicText}>{displayTopic}</Text>
          </View>
        </View>

        <View style={styles.scoreBox} nativeID="matching-card-score">
          <Image source={normalizeImageSource(ButtonWood)} style={styles.scoreBg} />
          <View style={styles.scoreContent}>
            <Text style={styles.scoreLabel}>{score} Điểm</Text>
          </View>
        </View>
      </View>

      {/* Right: Controls & Guide */}
      <View style={styles.rightSection}>
        {typeof onGuide === 'function' && (
          <Pressable onPress={onGuide} style={styles.guideBtn}>
            <Text style={styles.guideText}>Cách chơi</Text>
          </Pressable>
        )}
        {typeof onToggleSound === 'function' && (
          <Pressable
            onPress={onToggleSound}
            style={[styles.soundButton, isMuted ? styles.soundButtonMuted : null]}
          >
            <Text style={styles.soundIcon}>{isMuted ? '🔇' : '🔊'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',

  },
  centerSection: {
    flex: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
  },
  backButtonContainer: {
    width: 140,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  backArrow: {
    transform: [{ rotate: '0deg' }],
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  timeBox: {
    backgroundColor: 'rgba(245, 240, 221, 0.42)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    minWidth: 100,
  },
  timeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicBox: {
    width: 260,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topicBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
  topicContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  scoreBox: {
    width: 120,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  scoreContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '900',
    color: '#432C0D',
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topicText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  icon: {
    width: 28,
    height: 28,
  },
  carrot: {
    width: 40,
    height: 50,
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
  guideBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: '#8B4513',
  },
  guideText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  menuBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,

  },
  menuIcon: {
    width: 34,
    height: 34,
  },
  soundButton: {
    marginLeft: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF7EA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4D9C1',
  },
  soundButtonMuted: {
    opacity: 0.6,
  },
  soundIcon: {
    fontSize: 16,
  },
})
