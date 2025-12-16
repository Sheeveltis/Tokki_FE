import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useRouter } from 'next/navigation'
import { MatchingCardHeader } from './matching-card-header'
import { MatchingCard } from './matching-card'
import { getMatchingWords } from '../api/api'
import { BackButton } from '../../../../../../components/backbtn'

const shuffle = (list = []) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

export function MatchingCardLayout({ topicId = 'life', topicName, onBack }) {
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matchedIds, setMatchedIds] = useState([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const router = useRouter()

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
      const pairs = (list || []).flatMap((item) => [
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

  const goToResult = () => {
    if (finished) return
    setFinished(true)
    const query = new URLSearchParams()
    if (topicId) query.set('topic', topicId)
    if (topicName) query.set('topicName', topicName)
    query.set('score', String(score))
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
            return (
              <MatchingCard
                key={card.id}
                word={card}
                face={card.face}
                flipped={isFlipped || isMatched}
                matched={isMatched}
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
    justifyContent: 'space-between',
  },
})
