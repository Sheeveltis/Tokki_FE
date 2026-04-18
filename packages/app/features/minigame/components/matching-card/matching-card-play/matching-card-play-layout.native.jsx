import { useEffect, useMemo, useState } from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'
import { MatchingCardHeader } from './matching-card-play-header'
import { MatchingCardPlayBody } from './matching-card-play-body'
import { BackButton } from '../../../../../../components/backBtn'
import PlayBackground from '../../../../../../assets/BackgroundSolite.jpg'

const INITIAL_SECONDS = 600

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const calculateScoreByTime = (currentSeconds, initialSeconds = INITIAL_SECONDS) => {
  const timeRatio = Math.max(0, Math.min(1, currentSeconds / initialSeconds))
  const minScore = 10
  const maxScore = 100
  const scoreRange = maxScore - minScore
  return Math.round(minScore + (scoreRange * timeRatio))
}

export function MatchingCardLayout({ topicId, topicName, levelId = 'medium', quantity, onBack }) {
  const [flipped, setFlipped] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams?.get('gameId') || ''
  const hasPlayed = searchParams?.get('hasPlayed') === 'true'
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS)
  const [cardsCount, setCardsCount] = useState(0)
  
  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds])

  // Reset game state when topicId or levelId changes
  useEffect(() => {
    setFlipped([])
    setMatchedIds([])
    setScore(0)
    setFinished(false)
    setCardsCount(0)
    setSecondsLeft(INITIAL_SECONDS)
  }, [topicId, levelId])

  const handleFlipCard = (card) => {
    if (matchedSet.has(card.id)) return
    if (flipped.find((c) => c.id === card.id)) return
    if (flipped.length === 2) return
    setFlipped((prev) => [...prev, card])
  }

  useEffect(() => {
    if (flipped.length !== 2) return
    const [a, b] = flipped
    const isMatch = a.pairId === b.pairId && a.face !== b.face

    const timeout = setTimeout(() => {
      if (isMatch) {
        setMatchedIds((prev) => [...prev, a.id, b.id])
        const pointsEarned = calculateScoreByTime(secondsLeft, INITIAL_SECONDS)
        setScore((prev) => prev + pointsEarned)
      }
      setFlipped([])
    }, isMatch ? 350 : 800)

    return () => clearTimeout(timeout)
  }, [flipped, secondsLeft])

  const handleCardsLoaded = (count) => {
    setCardsCount(count)
  }

  useEffect(() => {
    if (!cardsCount) return
    if (finished) return
    if (matchedIds.length && matchedIds.length === cardsCount) {
      goToResult()
    }
  }, [matchedIds, cardsCount, finished])

  const goToResult = () => {
    if (finished) return
    setFinished(true)
    
    const query = new URLSearchParams()
    if (gameId) query.set('gameId', gameId)
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('level', levelId)
    query.set('score', String(score))
    query.set('time', String(secondsLeft))
    query.set('hasPlayed', String(hasPlayed))
    query.set('top', '5')
    
    router.push(`/minigame/matching-card/matching-card-result?${query.toString()}`)
  }

  const handleTimeUp = () => {
    goToResult()
  }

  return (
    <View style={styles.page}>
      {/* Background Image */}
      <Image
        source={normalizeImageSource(PlayBackground)}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      <MatchingCardHeader
        topicId={topicId}
        topicName={topicName}
        score={score}
        onTimeUp={handleTimeUp}
        onFinish={goToResult}
        onTick={setSecondsLeft}
        onBack={onBack}
        isMuted={true}
        onMenu={() => {}}
        onGuide={() => {}}
        staticMode={false}
      />

      {topicId && topicId !== '' ? (
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
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
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

export default MatchingCardLayout
