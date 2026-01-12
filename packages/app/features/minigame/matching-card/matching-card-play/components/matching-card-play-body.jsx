import React, { useEffect, useMemo, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { MatchingCard } from './matching-card'
import { getMatchingCards } from '../api/api'

const shuffle = (list = []) => {
  const arr = [...list]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

const LEVEL_CONFIG = {
  easy: { pairs: 12, size: 'large' },
  medium: { pairs: 18, size: 'medium' },
  hard: { pairs: 27, size: 'small' },
}

/**
 * Body component for matching card game - handles card display and game logic
 * @param {{
 *   topicId: string
 *   levelId: string
 *   quantity?: number
 *   flipped: Array
 *   matchedIds: Array
 *   onFlipCard: (card) => void
 *   onCardsLoaded?: (count: number) => void
 * }} props
 */
export function MatchingCardPlayBody({ topicId, levelId, quantity: quantityProp, flipped, matchedIds, onFlipCard, onCardsLoaded }) {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(false)

  const levelConfig = LEVEL_CONFIG[levelId] || LEVEL_CONFIG.medium
  const pairCount = levelConfig.pairs
  // Use quantity from props if provided, otherwise calculate from levelId
  const quantity = quantityProp || pairCount

  const matchedSet = useMemo(() => new Set(matchedIds), [matchedIds])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      // Validate topicId - must be a valid string (not empty, not 'life')
      if (!topicId || typeof topicId !== 'string' || topicId.trim() === '' || topicId === 'life') {
        console.warn('[MatchingCardPlayBody] Invalid topicId:', topicId)
        setLoading(false)
        setCards([])
        return
      }
      
      // Validate quantity - must be a valid number
      if (!quantity || quantity <= 0) {
        console.warn('[MatchingCardPlayBody] Invalid quantity:', quantity)
        setLoading(false)
        setCards([])
        return
      }
      
      setLoading(true)
      try {
        console.log('[MatchingCardPlayBody] Fetching matching cards:', { 
          topicId, 
          quantity, 
          levelId,
          pairCount 
        })
        const list = await getMatchingCards(topicId, quantity)
        if (!mounted) return

        console.log('Received data:', list)
        if (!list || list.length === 0) {
          console.warn('No cards received from API')
          return
        }

        const base = shuffle(list || [])
        const selected = base.slice(0, pairCount)
        const pairs = selected.flatMap((item) => [
          { id: `${item.id}-ko`, pairId: item.id, ko: item.ko, vi: item.vi, face: 'ko', imgUrl: null },
          { id: `${item.id}-vi`, pairId: item.id, ko: item.ko, vi: item.vi, face: 'vi', imgUrl: item.imgUrl || null },
        ])
        const shuffledCards = shuffle(pairs)
        setCards(shuffledCards)
        if (typeof onCardsLoaded === 'function') {
          onCardsLoaded(shuffledCards.length)
        }
      } catch (error) {
        console.error('Error loading matching cards:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [topicId, quantity, pairCount])

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#7FA14D" />
      </View>
    )
  }

  return (
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
            onFlip={() => onFlipCard(card)}
            imgUrl={card.imgUrl}
          />
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    justifyContent: 'center',
  },
  cardLarge: {
    transform: [{ scale: 1.0 }],
    margin: 15,
  },
  cardMedium: {
    transform: [{ scale: 1.0 }],
    margin: 6,
  },
  cardSmall: {
    transform: [{ scale: 0.8 }],
    margin: -10,
  },
})

