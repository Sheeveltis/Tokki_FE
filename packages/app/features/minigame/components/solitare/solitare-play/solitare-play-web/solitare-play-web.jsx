import React, { useEffect, useRef, useState } from 'react'
import confetti from 'canvas-confetti'
import BackgroundSolite from '../../../../../../../assets/BackgroundSolite.png'
import { getSolitareLayout } from '../../../../api/solitare-play-api'
import { SolitarePlayWebHeader } from './solitare-play-web-header'
import { SolitarePlayWebBody } from './solitare-play-web-body'
import { SolitarePlayWebMovingCard } from './solitare-play-web-moving-card'

// Styles for main component
const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
    backgroundImage: `url(${BackgroundSolite})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    paddingBottom: '12px',
    boxSizing: 'border-box',
  },
  inner: {
    width: '100%',
    maxWidth: 1250,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexShrink: 0,
    overflow: 'hidden',
  },
}

// Scoring constants
const MAX_SCORE_CORRECT_CARD = 30
const SCORE_COMPLETE_COLUMN = 100
const TIME_BONUS_MULTIPLIER = 0.1

export function SolitarePlayWeb({ level = 'Easy', onFinish }) {
  const [columns, setColumns] = useState([])
  const [slots, setSlots] = useState([])
  const [draggedCards, setDraggedCards] = useState(null) 
  const [movingCard, setMovingCard] = useState(null) 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [timeLeft, setTimeLeft] = useState(600)
  const [score, setScore] = useState(0)
  const [isGameWon, setIsGameWon] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [topicCardCounts, setTopicCardCounts] = useState({})
  
  const cardRefs = useRef({})
  const slotRefs = useRef({})
  const columnRefs = useRef({})
  const isProcessingDrop = useRef(false)
  const completedColumnsRef = useRef(new Set())

  const injectTopicCardsIntoLayout = (layout) => {
    // For each column, insert 1 topic card at a random non-top position.
    // Topic card uses same topicId as the card below it to avoid breaking existing move rules.
    return layout.map((col) => {
      if (!col.cards || col.cards.length < 3) return col

      const insertPos = 1 + Math.floor(Math.random() * (col.cards.length - 2))
      const below = col.cards[insertPos - 1]

      const topicCard = {
        id: `topic-${col.id}-${below.topicId}-${insertPos}`,
        topicId: below.topicId,
        topicName: below.topicName,
        text: below.topicName || below.text,
        isTopic: true,
      }

      const nextCards = [...col.cards]
      nextCards.splice(insertPos, 0, topicCard)

      return { ...col, cards: nextCards }
    })
  }

  useEffect(() => {
    getSolitareLayout(level)
      .then((layout) => {
        const withTopicCards = injectTopicCardsIntoLayout(layout)

        setColumns(withTopicCards)
        setSlots([
          ...Array(4).fill(null).map(() => ({ topicId: null, name: null, cards: [], isTempSlot: true })),
        ])

        // Count total cards per topic from the layout (ignore topic cards)
        const counts = {}
        withTopicCards.forEach(col => {
          col.cards.forEach(card => {
            if (card.isTopic) return
            counts[card.topicId] = (counts[card.topicId] || 0) + 1
          })
        })
        setTopicCardCounts(counts)

        const initialFlipped = new Set()
        withTopicCards.forEach((col) => {
          if (col.cards.length > 0) {
            const topCard = col.cards[col.cards.length - 1]
            initialFlipped.add(topCard.id)
          }
        })
        setFlippedCards(initialFlipped)
      })
      .catch((error) => console.error('Failed to load solitaire layout:', error))
  }, [level])

  useEffect(() => {
    if (isGameWon) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isGameWon])

  useEffect(() => {
    const totalTopics = Object.keys(topicCardCounts).length
    const completedCount = completedColumnsRef.current.size

    if (totalTopics > 0 && completedCount === totalTopics && !isGameWon) {
      setIsGameWon(true)
      const timeBonus = Math.floor(timeLeft * TIME_BONUS_MULTIPLIER)
      const finalScore = score + timeBonus
      setScore(finalScore)

      // Fire confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const remaining = animationEnd - Date.now()

        if (remaining <= 0) {
          clearInterval(interval)
          if (onFinish) {
            onFinish(finalScore, timeLeft)
          }
          return
        }

        const particleCount = 50 * (remaining / duration)
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
      }, 250)
    }
  }, [columns, timeLeft, isGameWon, score, onFinish, topicCardCounts])

  const getCardsToDrag = (columnIndex, startCardIndex) => {
    const col = columns[columnIndex]
    if (!col || startCardIndex < 0 || startCardIndex >= col.cards.length) return []
    return col.cards.slice(startCardIndex)
  }

  const canDragCardsTogether = (cards) => {
    if (cards.length === 0) return false
    if (cards.length === 1) return true
    const firstTopicId = cards[0].topicId
    return cards.every(card => card.topicId === firstTopicId)
  }

  const isColumnLocked = (columnIndex) => {
    const col = columns[columnIndex]
    if (!col || col.cards.length === 0) return false

    const firstTopicId = col.cards[0].topicId
    if (!firstTopicId) return false

    const isHomogeneous = col.cards.every(c => c.topicId === firstTopicId)
    if (!isHomogeneous) return false

    const required = topicCardCounts[firstTopicId]
    if (!required) return false

    return col.cards.length === required
  }

  const awardCorrectPlacementScore = (cardsMovedCount) => {
    const pointsToAdd = Math.max(1, Math.floor(MAX_SCORE_CORRECT_CARD / cardsMovedCount))
    setScore(prev => prev + pointsToAdd)
  }

  const maybeAwardCompleteColumn = (columnIndex, nextCards) => {
    if (!nextCards || nextCards.length === 0) return

    const topicId = nextCards[0].topicId
    if (!topicId) return

    const required = topicCardCounts[topicId]
    if (!required) return

    const isHomogeneous = nextCards.every(c => c.topicId === topicId)
    if (!isHomogeneous) return

    if (nextCards.length !== required) return

    if (completedColumnsRef.current.has(columnIndex)) return

    completedColumnsRef.current.add(columnIndex)
    setScore(prev => prev + SCORE_COMPLETE_COLUMN)
  }

  const handleMouseDown = (e, card, cardIndex, sourceIndex = null) => {
    e.preventDefault()
    e.stopPropagation()
    
    const startX = e.pageX
    const startY = e.pageY
    
    setIsDragging(true)
    setMousePos({ x: startX, y: startY })
    isProcessingDrop.current = false

    let cardsToDrag = []
    let isFromSlot = false
    let slotIdx = null
    let colIdx = null

    if (sourceIndex !== null && sourceIndex < 0) {
      isFromSlot = true
      slotIdx = Math.abs(sourceIndex) - 1
      cardsToDrag = [card]
    } else {
      colIdx = sourceIndex
      if (isColumnLocked(colIdx)) {
        setIsDragging(false)
        return
      }
      cardsToDrag = getCardsToDrag(colIdx, cardIndex)
      if (!canDragCardsTogether(cardsToDrag)) {
        setIsDragging(false)
        return
      }
    }

    const rect = e.currentTarget.getBoundingClientRect()
    const cardPageX = rect.left + window.scrollX
    const cardPageY = rect.top + window.scrollY

    setDraggedCards({
      cards: cardsToDrag,
      fromX: cardPageX,
      fromY: cardPageY,
      isFromSlot,
      slotIndex: slotIdx,
      columnIndex: colIdx,
      startCardIndex: cardIndex,
      offsetX: startX - cardPageX,
      offsetY: startY - cardPageY,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setMousePos({ x: e.pageX, y: e.pageY })
      }
    }

    const handleMouseUp = (e) => {
      if (isProcessingDrop.current) {
        return
      }
      if (!isDragging || !draggedCards) {
        setIsDragging(false)
        return
      }
      isProcessingDrop.current = true
      

      const elementBelow = document.elementFromPoint(e.clientX, e.clientY)
      const slotWrapper = elementBelow?.closest('[data-slot-index]')
      const columnWrapper = elementBelow?.closest('[data-column-index]')

      let targetFound = false
      let targetX, targetY, targetType, targetIndex

      if (slotWrapper) {
        targetIndex = parseInt(slotWrapper.dataset.slotIndex)
        const slotEl = slotRefs.current[targetIndex]
        const rect = slotEl?.getBoundingClientRect()
        if (rect) {
          targetX = rect.left + window.scrollX + rect.width / 2
          targetY = rect.top + window.scrollY + rect.height / 2
          targetType = 'slot'
          targetFound = true
        }
      } else if (columnWrapper) {
        targetIndex = parseInt(columnWrapper.dataset.columnIndex)
        const colEl = columnRefs.current[targetIndex]
        const rect = colEl?.getBoundingClientRect()
        if (rect) {
          const col = columns[targetIndex]
          targetX = rect.left + window.scrollX + rect.width / 2
          
          // Calculate targetY based on the last card position in the column
          if (col.cards.length === 0) {
            targetY = rect.top + window.scrollY + 80
          } else {
            // Find the last card in the column and use its position
            const lastCard = col.cards[col.cards.length - 1]
            const lastCardEl = cardRefs.current[lastCard.id]
            if (lastCardEl) {
              const lastCardRect = lastCardEl.getBoundingClientRect()
              // Position new card below the last card with stack offset
              const stackOffset = 50 // Match CARD_STACK_OFFSET from column-card
              targetY = lastCardRect.bottom + window.scrollY - stackOffset
            } else {
              // Fallback: calculate based on card count and stack offset
              const stackOffset = 95
              const cardHeight = 144
              const paddingTop = 10
              targetY = rect.top + window.scrollY + paddingTop + (col.cards.length * (cardHeight - stackOffset)) + cardHeight / 2
            }
          }
          targetType = 'column'
          targetFound = true
        }
      }

      if (targetFound) {
        // Check if dropping from slot to column - add bounce animation
        const isFromSlotToColumn = draggedCards.isFromSlot && targetType === 'column'
        
        setMovingCard({
          cards: draggedCards.cards,
          fromX: e.pageX - draggedCards.offsetX,
          fromY: e.pageY - draggedCards.offsetY,
          toX: targetX,
          toY: targetY,
          targetType,
          targetIndex,
          isFromSlotToColumn, // Flag to trigger bounce animation
        })
      } else {
        setMovingCard({
          cards: draggedCards.cards,
          fromX: e.pageX - draggedCards.offsetX,
          fromY: e.pageY - draggedCards.offsetY,
          toX: draggedCards.fromX,
          toY: draggedCards.fromY,
          targetType: 'cancel',
          targetIndex: null,
        })
      }
      
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, draggedCards, columns, slots])

  const handleCardAnimationComplete = () => {
    if (!movingCard || !draggedCards) return
    if (!isProcessingDrop.current) {
      return
    }
    const { targetType, targetIndex } = movingCard

    // Clear movingCard and draggedCards BEFORE processing drop logic
    // to prevent any potential re-triggers or duplicate processing
    const dragData = { ...draggedCards }
    setMovingCard(null)
    setDraggedCards(null)
    setIsDragging(false)
    isProcessingDrop.current = false

    if (targetType === 'slot') {
      handleDropOnSlot(targetIndex, dragData)
    } else if (targetType === 'column') {
      handleDropOnColumn(targetIndex, dragData)
    }
  }

  const handleDropOnSlot = (slotIndex, dragData) => {
    if (!dragData) return
    const slot = slots[slotIndex]
    const { cards, isFromSlot, slotIndex: fromSlotIndex, columnIndex, startCardIndex } = dragData

    // Block topic cards from being dropped into slots
    const draggedCard = cards[0]
    if (draggedCard.isTopic) {
      return
    }

    if (slot.isTempSlot) {
      if (cards.length !== 1 || slot.cards.length > 0) return
      if (isFromSlot) moveCardsFromSlotToSlot(fromSlotIndex, slotIndex, cards)
      else {
        moveCardsToSlot(columnIndex, startCardIndex, slotIndex, cards)
        setTimeout(() => flipCardBelow(columnIndex, startCardIndex - 1), 500)
      }
    } else {
      const card = cards[0]
      if (slot.cards.length === 0 || slot.topicId === card.topicId) {
        if (isFromSlot) moveCardsFromSlotToSlot(fromSlotIndex, slotIndex, cards)
        else moveCardsToSlot(columnIndex, startCardIndex, slotIndex, cards)
      }
    }
  }

  const handleDropOnColumn = (targetColumnIndex, dragData) => {
    if (!dragData) return
    const { cards, isFromSlot, slotIndex: fromSlotIndex, columnIndex, startCardIndex } = dragData
    const targetCol = columns[targetColumnIndex]
    if (!targetCol || (columnIndex === targetColumnIndex && !isFromSlot)) return

    const draggedCard = cards[0]
    const targetColTopCard = targetCol.cards.length > 0 ? targetCol.cards[targetCol.cards.length - 1] : null

    // Block topic cards from being placed on top of other cards
    // Only allow non-topic cards to be placed on topic cards
    if (draggedCard.isTopic && targetColTopCard && !targetColTopCard.isTopic) {
      return
    }

    // Normal drop logic: empty column or matching topicId
    if (targetCol.cards.length === 0 || (targetColTopCard && targetColTopCard.topicId === draggedCard.topicId)) {
      if (isFromSlot) moveCardsFromSlotToColumn(fromSlotIndex, targetColumnIndex, cards)
      else {
        moveCardsToColumn(columnIndex, startCardIndex, targetColumnIndex, cards)
        setTimeout(() => flipCardBelow(columnIndex, startCardIndex - 1), 500)
      }
    }
  }

  const flipCardBelow = (columnIndex, cardIndex) => {
    if (cardIndex < 0) return
    const col = columns[columnIndex]
    if (!col || cardIndex >= col.cards.length) return
    const card = col.cards[cardIndex]
    if (card) {
      setFlippedCards(prev => new Set([...prev, card.id]))
    }
  }

  const moveCardsToSlot = (fromColumnIndex, startCardIndex, slotIndex, cards) => {
    setColumns(prev =>
      prev.map((col, idx) =>
        idx !== fromColumnIndex ? col : { ...col, cards: col.cards.filter((_, i) => i < startCardIndex) },
      ),
    )
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      cards.forEach(card => newSet.add(card.id))
      return newSet
    })
    setSlots(prev =>
      prev.map((slot, idx) => {
        if (idx !== slotIndex) return slot
        const topicId = slot.topicId || cards[0].topicId
        const name = slot.name || cards[0].topicName || cards[0].text
        return { ...slot, topicId, name, cards: [...slot.cards, ...cards] }
      }),
    )
    // No score for moving to slots as requested
  }

  const moveCardsToColumn = (fromColumnIndex, startCardIndex, toColumnIndex, cards) => {
    setColumns(prev => {
      let nextTargetCards = null

      const next = prev.map((col, idx) => {
        if (idx === fromColumnIndex) {
          return { ...col, cards: col.cards.filter((_, i) => i < startCardIndex) }
        }
        if (idx === toColumnIndex) {
          nextTargetCards = [...col.cards, ...cards]
          return { ...col, cards: nextTargetCards }
        }
        return col
      })

      if (nextTargetCards) {
        maybeAwardCompleteColumn(toColumnIndex, nextTargetCards)
      }

      return next
    })

    awardCorrectPlacementScore(cards.length)
  }

  const moveCardsFromSlotToSlot = (fromSlotIndex, toSlotIndex, cards) => {
    setSlots(prev =>
      prev.map((slot, idx) => {
        if (idx === fromSlotIndex) return { ...slot, cards: [], topicId: null, name: null }
        if (idx === toSlotIndex) {
          const topicId = slot.topicId || cards[0].topicId
          const name = slot.name || cards[0].topicName || cards[0].text
          return { ...slot, topicId, name, cards: [...slot.cards, ...cards] }
        }
        return slot
      }),
    )
    // No score for moving to/between slots
  }

  const moveCardsFromSlotToColumn = (fromSlotIndex, toColumnIndex, cards) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      cards.forEach(card => newSet.add(card.id))
      return newSet
    })

    setSlots(prev =>
      prev.map((slot, idx) => idx === fromSlotIndex ? { ...slot, cards: [], topicId: null, name: null } : slot),
    )

    setColumns(prev => {
      let nextTargetCards = null

      const next = prev.map((col, idx) => {
        if (idx === toColumnIndex) {
          nextTargetCards = [...col.cards, ...cards]
          return { ...col, cards: nextTargetCards }
        }
        return col
      })

      if (nextTargetCards) {
        maybeAwardCompleteColumn(toColumnIndex, nextTargetCards)
      }

      return next
    })

    awardCorrectPlacementScore(cards.length)
  }

  const setSlotRef = (index, el) => { slotRefs.current[index] = el }
  const setCardRef = (cardId, el) => { cardRefs.current[cardId] = el }
  const setColumnRef = (index, el) => { columnRefs.current[index] = el }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <SolitarePlayWebHeader timeLeft={timeLeft} score={score} isGameWon={isGameWon} level={level} />
        <SolitarePlayWebBody
          slots={slots}
          columns={columns}
          draggedCards={draggedCards}
          movingCard={movingCard}
          flippedCards={flippedCards}
          setSlotRef={setSlotRef}
          setCardRef={setCardRef}
          setColumnRef={setColumnRef}
          onMouseDown={handleMouseDown}
        />
      </div>
      <SolitarePlayWebMovingCard 
        movingCard={movingCard || draggedCards} 
        isDragging={isDragging}
        mousePos={mousePos}
        onAnimationComplete={handleCardAnimationComplete}
      />
    </div>
  )
}
export default SolitarePlayWeb
