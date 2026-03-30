import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View, Text, Pressable } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { MatchingCardHeader } from './matching-card-play-header'
import { MatchingCardPlayBody } from './matching-card-play-body'
import { MatchingCardTour, hasSeenMatchingCardTour } from './matching-card-tour'
import { BackButton } from '../../../../../../components/backBtn'
import { showAdminSuccess } from 'components/HelperAdmin'
import ThemeMusic from '../../../../../../assets/sound-effect/solitare/theme.mp3'
import TapSound from '../../../../../../assets/sound-effect/solitare/tap.wav'
import WinSound from '../../../../../../assets/sound-effect/solitare/win.mp3'
import MenuBackground from '../../../../../../assets/menu2.png'
import confetti from 'canvas-confetti'

const INITIAL_SECONDS = 600

/**
 * Tính điểm dựa trên thời gian còn lại
 * - Thời gian đầy đủ (600s) → 100 điểm
 * - Thời gian gần hết (0s) → 10 điểm (tối thiểu)
 * - Công thức: điểm = 10 + (90 * (secondsLeft / initialSeconds))
 */
const calculateScoreByTime = (currentSeconds, initialSeconds = INITIAL_SECONDS) => {
  const timeRatio = Math.max(0, Math.min(1, currentSeconds / initialSeconds)) // Từ 0 đến 1
  const minScore = 10 // Điểm tối thiểu
  const maxScore = 100 // Điểm tối đa
  const scoreRange = maxScore - minScore // 90 điểm
  return Math.round(minScore + (scoreRange * timeRatio))
}


export function MatchingCardLayout({ topicId, topicName, levelId = 'medium', quantity, onBack }) {
  const [flipped, setFlipped] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const userKey = getUserIdFromToken()
  const [showMenuPopup, setShowMenuPopup] = useState(false)
  const [runTour, setRunTour] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams?.get('gameId') || ''
  const hasPlayed = searchParams?.get('hasPlayed') === 'true'
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS)
  const [cardsCount, setCardsCount] = useState(0)
  const backgroundMusicRef = useRef(null)
  const tapSoundRef = useRef(null)
  const winSoundRef = useRef(null)
  const [isMuted, setIsMuted] = useState(false)
  const hasPlayedWinRef = useRef(false)
  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds])
  // Debug: Log params khi component mount
  useEffect(() => {
    console.log('[MatchingCardLayout] Play screen params:', {
      gameId,
      topicId,
      levelId,
      hasPlayed,
    })
  }, [gameId, topicId, levelId, hasPlayed])



  // Reset game state when topicId or levelId changes
  useEffect(() => {
      setFlipped([])
      setMatchedIds([])
      setScore(0)
    setFinished(false)
    setCardsCount(0)
    setSecondsLeft(INITIAL_SECONDS)
  }, [topicId, levelId])

  // Initialize background music
  useEffect(() => {
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio(ThemeMusic)
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = 0.5

      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          console.log('[MatchingCardLayout] Background music will play after user interaction')
        })
      }
    }

    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
        backgroundMusicRef.current = null
      }
    }
  }, [])

  // Initialize tap sound effect
  useEffect(() => {
    if (!tapSoundRef.current) {
      tapSoundRef.current = new Audio(TapSound)
      tapSoundRef.current.volume = 0.7
    }

    return () => {
      tapSoundRef.current = null
    }
  }, [])

  // Initialize win sound effect
  useEffect(() => {
    if (!winSoundRef.current) {
      winSoundRef.current = new Audio(WinSound)
      winSoundRef.current.volume = 0.8
    }

    return () => {
      winSoundRef.current = null
    }
  }, [])

  // Toggle mute for background music
  useEffect(() => {
    if (!backgroundMusicRef.current) return
    backgroundMusicRef.current.volume = isMuted ? 0 : 0.5

    if (isMuted) {
      backgroundMusicRef.current.pause()
    } else {
      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // ignore autoplay errors
        })
      }
    }
  }, [isMuted])

  function getUserIdFromToken() {
    try {
      const rawToken = localStorage.getItem('token')
      if (!rawToken) {
        console.warn('No token found')
        return 'guest'
      }
  
      let token = rawToken
  
      // Nếu token không phải JWT thì decode base64 trước
      if (!rawToken.includes('.')) {
        try {
          token = atob(rawToken)
        } catch {
          console.warn('Token is not base64')
          return 'guest'
        }
      }
  
      const parts = token.split('.')
      if (parts.length < 2) {
        console.warn('Invalid JWT format after decode')
        return 'guest'
      }
  
      const payload = JSON.parse(atob(parts[1]))
  
      console.log('JWT PAYLOAD:', payload)
  
      return (
        payload?.UserId ||
        payload?.userId ||
        payload?.id ||
        payload?.sub ||
        payload?.nameid ||
        payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
        'guest'
      )
    } catch (e) {
      console.error('Decode token failed:', e)
      return 'guest'
    }
  }

  const handleFlipCard = (card) => {
    if (runTour) return
    if (matchedSet.has(card.id)) return
    if (flipped.find((c) => c.id === card.id)) return
    if (flipped.length === 2) return

    if (tapSoundRef.current && !isMuted) {
      tapSoundRef.current.currentTime = 0
      const playPromise = tapSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // ignore autoplay errors
        })
      }
    }

    setFlipped((prev) => [...prev, card])
  }

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const isMatch = a.pairId === b.pairId && a.face !== b.face

    const timeout = setTimeout(() => {
      if (isMatch) {
        setMatchedIds((prev) => [...prev, a.id, b.id])
        // Tính điểm dựa trên thời gian còn lại
        const pointsEarned = calculateScoreByTime(secondsLeft, INITIAL_SECONDS)
        setScore((prev) => prev + pointsEarned)
        console.log(`[MatchingCardLayout] Match! Time left: ${secondsLeft}s, Points earned: ${pointsEarned}`)
      }
      setFlipped([])
    }, isMatch ? 350 : 800)

    return () => clearTimeout(timeout)
  }, [flipped, secondsLeft])

  // Track cards count from body component
  const handleCardsLoaded = (count) => {
    setCardsCount(count)
  }

  useEffect(() => {
    if (!cardsCount) return
    if (finished) return
    if (matchedIds.length && matchedIds.length === cardsCount) {
      showAdminSuccess('Bạn đã thành công vượt qua thử thách!')
      goToResult()
    }
  }, [matchedIds, cardsCount, finished])

  const runWinEffects = () => {
    if (hasPlayedWinRef.current) return
    hasPlayedWinRef.current = true

    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
    }

    if (winSoundRef.current && !isMuted) {
      winSoundRef.current.currentTime = 0
      const playPromise = winSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // ignore autoplay errors
        })
      }
    }

    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min, max) => Math.random() * (max - min) + min

    const interval = setInterval(() => {
      const remaining = animationEnd - Date.now()

      if (remaining <= 0) {
        clearInterval(interval)
        return
      }

      const particleCount = 50 * (remaining / duration)
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
  }

  const goToResult = () => {
    if (finished) return
    setFinished(true)
    runWinEffects(score, secondsLeft)
    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelId)
    query.set('score', String(score))
    query.set('time', String(secondsLeft))
    query.set('hasPlayed', String(hasPlayed)) // Truyền flag để biết dùng POST hay PUT
    query.set('top', '5')
    
    // Debug: Log params trước khi navigate
    console.log('[MatchingCardLayout] Navigating to result with params:', {
      gameId,
      topicId,
      levelId,
      score,
      hasPlayed,
      url: `/minigame/matching-card/matching-card-result?${query.toString()}`,
    })
    
    router.push(`/minigame/matching-card/matching-card-result?${query.toString()}`)
  }

  const handleTimeUp = () => {
    goToResult()
  }

  const handleToggleSound = () => {
    setIsMuted((prev) => !prev)
  }

  const handleMenuClick = () => {
    setShowMenuPopup(true)
  }

  const handleContinue = () => {
    setShowMenuPopup(false)
  }

  const handleQuit = () => {
    setShowMenuPopup(false)
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  const handleHowToPlay = () => {
    setShowMenuPopup(false)
    setTimeout(() => {
      setRunTour(true)
    }, 300)
  }

  // Auto-run tour once
  useEffect(() => {
    try {
      if (!topicId || topicId === 'life') return
      if (hasSeenMatchingCardTour(userKey)) return
  
      const timer = setTimeout(() => {
        setRunTour(true)
      }, 300)
  
      return () => clearTimeout(timer)
    } catch (e) {
      // ignore
    }
  }, [topicId, userKey])

  // Stop/resume music based on game state
  useEffect(() => {
    if (finished && backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
      return
    }

    if (backgroundMusicRef.current) {
      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // ignore autoplay errors
        })
      }
    }
  }, [finished])

  return (
    <>
      <View style={styles.page}>
        <View style={styles.headerRow}>
          <View style={styles.backWrap}>{onBack ? <BackButton onPress={onBack} /> : null}</View>
          <MatchingCardHeader
            topicId={topicId}
            topicName={topicName}
            score={score}
            onTimeUp={handleTimeUp}
            onFinish={goToResult}
            onTick={setSecondsLeft}
            onBack={onBack}
            onToggleSound={handleToggleSound}
            isMuted={isMuted}
            onMenu={handleMenuClick}
            onGuide={handleHowToPlay}
            staticMode={runTour}
          />
          <View style={styles.rankSpacer} />
        </View>
  
        {topicId && topicId !== '' && topicId !== 'life' ? (
          <MatchingCardPlayBody
            topicId={topicId}
            levelId={levelId}
            quantity={quantity}
            flipped={flipped}
            matchedIds={matchedIds}
            onFlipCard={handleFlipCard}
            onCardsLoaded={handleCardsLoaded}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Vui lòng chọn chủ đề trước khi chơi</Text>
          </View>
        )}
      </View>
  
      <MatchingCardTour run={runTour} setRun={setRunTour} userKey={userKey} />
      {showMenuPopup && <MatchingCardMenuPopup onContinue={handleContinue} onQuit={handleQuit} />}
    </>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: '100%',
    backgroundColor: '#F3EEDC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 60,
  },
  backWrap: {
    width: 80,
  },
  rankSpacer: {
    width: 80,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
})

function MatchingCardMenuPopup({ onContinue, onQuit }) {
  return (
    <View style={popupStyles.overlay}>
      <View style={popupStyles.popup}>
        <View style={popupStyles.buttonsContainer}>
          <Pressable style={popupStyles.button} onPress={onContinue}>
            <Text style={popupStyles.buttonText}>Tiếp tục</Text>
          </Pressable>
          <Pressable style={popupStyles.button} onPress={onQuit}>
            <Text style={popupStyles.buttonText}>Thoát</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const popupStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  popup: {
    backgroundImage: `url(${MenuBackground})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    width: '90%',
    maxWidth: 500,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 40,
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  buttonsContainer: {
    width: '70%',
    maxWidth: 300,
    gap: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#8B4513',
    borderWidth: 3,
    borderColor: '#654321',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})
