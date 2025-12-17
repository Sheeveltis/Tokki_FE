import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useRouter } from 'next/navigation'
import { MatchingCardHeader } from './matching-card-header'
import { MatchingCard } from './matching-card'
import { getMatchingWords } from '../api/api'
import { BackButton } from '../../../../../../components/backbtn'
import { showAdminSuccess } from 'components/HelperAdmin'

const shuffle = (list = []) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const LEVEL_CONFIG = {
  easy: { pairs: 5, size: 'large' },
  medium: { pairs: 10, size: 'medium' },
  hard: { pairs: 18, size: 'small' },
}

export function MatchingCardLayout({ topicId = 'life', topicName, levelId = 'medium', onBack }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const router = useRouter()

  const levelConfig = LEVEL_CONFIG[levelId] || LEVEL_CONFIG.medium
  const pairCount = levelConfig.pairs
  const [secondsLeft, setSecondsLeft] = useState(600)

  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setFlipped([])
      setMatchedIds([])
      setScore(0)
      const list = await getMatchingWords(topicId)
      if (!mounted) return
      const base = shuffle(list || [])
      const selected = base.slice(0, pairCount)
      const pairs = selected.flatMap((item) => [
        { id: `${item.id}-ko`, pairId: item.id, ko: item.ko, vi: item.vi, face: 'ko' },
        { id: `${item.id}-vi`, pairId: item.id, ko: item.ko, vi: item.vi, face: 'vi' },
      ])
      setCards(shuffle(pairs))
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [topicId])

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
        setScore((prev) => prev + 10)
      }
      setFlipped([])
    }, isMatch ? 350 : 800)

    return () => clearTimeout(timeout)
  }, [flipped])

  useEffect(() => {
    if (!cards.length) return
    if (finished) return
    if (matchedIds.length && matchedIds.length === cards.length) {
      showAdminSuccess('Bạn đã thành công vượt qua thử thách!')
      goToResult()
    }
  }, [matchedIds, cards.length, finished])

  const goToResult = () => {
    if (finished) return
    setFinished(true)
    const query = new URLSearchParams()
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('score', String(score))
    query.set('time', String(secondsLeft))
    query.set('top', '5')
    router.push(`/minigame/matching-card/matching-card-result?${query.toString()}`)
  }

  const handleTimeUp = () => {
    goToResult()
  }

  return (
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
        />
        <View style={styles.rankSpacer} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#7FA14D" />
        </View>
      ) : (
        <View style={styles.grid}>
          {cards.map((card) => {
            const isFlipped = flipped.some((c) => c.id === card.id)
            const isMatched = matchedSet.has(card.id)
            const sizeStyle =
              levelConfig.size === 'large'
                ? styles.cardLarge
                : levelConfig.size === 'small'
                ? styles.cardSmall
                : styles.cardMedium
            return (
              <MatchingCard
                key={card.id}
                word={card}
                face={card.face}
                flipped={isFlipped || isMatched}
                matched={isMatched}
                style={sizeStyle}
                onFlip={() => handleFlipCard(card)}
              />
            )
          })}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3EEDC',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 90,
  },
  backWrap: {
    width: 80,
  },
  rankSpacer: {
    width: 80,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
  },
  cardLarge: {
    transform: [{ scale: 1.5 }],
    margin: 60,
  },
  cardMedium: {
    transform: [{ scale: 1.3 }],
    margin: 25,
  },
  cardSmall: {
    transform: [{ scale: 0.9 }],
    margin: 0,
  },
})
