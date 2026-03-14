import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import BackgroundSolite from '../../../../../../../assets/BackgroundSolite.png'
import ThemeMusic from '../../../../../../../assets/sound-effect/solitare/theme.mp3'
import TickSound from '../../../../../../../assets/sound-effect/solitare/tick.mp3'
import WinSound from '../../../../../../../assets/sound-effect/solitare/win.mp3'
import MenuBackground from '../../../../../../../assets/menu2.png'
import { getSolitareLayout } from '../../../../api/solitare-play-api'
import { SolitarePlayWebHeader } from './solitare-play-web-header'
import { SolitarePlayWebBody } from './solitare-play-web-body'
import { SolitarePlayWebMovingCard } from './solitare-play-web-moving-card'
import { SolitareGameOverPopup } from './solitare-game-over-popup'
import { SolitarePlayWebTour } from './solitare-play-web-tour'

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
const SCORE_PER_CARD = 10 // Points per card when placed correctly
const TIME_BONUS_MULTIPLIER = 0.1

export function SolitarePlayWeb({ level = 'easy', onFinish }) {
  const [columns, setColumns] = useState([])
  const [slots, setSlots] = useState([])
  const [draggedCards, setDraggedCards] = useState(null) 
  const [movingCard, setMovingCard] = useState(null) 
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [flippedCards, setFlippedCards] = useState(new Set())
  const [placedCards, setPlacedCards] = useState(new Set()) // Track cards that have been correctly placed
  const [timeLeft, setTimeLeft] = useState(600)
  const [score, setScore] = useState(0)
  const [isGameWon, setIsGameWon] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [topicCardCounts, setTopicCardCounts] = useState({})
  const [showMenuPopup, setShowMenuPopup] = useState(false)
  const [floatingScores, setFloatingScores] = useState([]) // score animations
  const [runTour, setRunTour] = useState(false)
  const cardRefs = useRef({})
  const slotRefs = useRef({})
  const columnRefs = useRef({})
  const isProcessingDrop = useRef(false)
  const completedColumnsRef = useRef(new Set())
  const backgroundMusicRef = useRef(null)
  const tickSoundRef = useRef(null)
  const winSoundRef = useRef(null)

  const injectTopicCardsIntoLayout = (layout) => {
    // Mỗi topicId chỉ có đúng 1 topic card trong toàn bộ layout (KHÔNG ĐƯỢC LẶP)
    // B0: nếu API đã trả ra topic card sẵn thì coi như đã "used" và không inject thêm nữa
    const usedTopicIds = new Set()
    layout.forEach((col) => {
      ;(col.cards || []).forEach((card) => {
        if (!card?.isTopic) return
        if (card.topicId) {
          usedTopicIds.add(String(card.topicId))
        }
      })
    })

    // B1: gom tất cả vị trí có thể chèn topic card cho từng topicId
    const topicPositions = {}

    layout.forEach((col, colIndex) => {
      if (!col.cards || col.cards.length === 0) return

      col.cards.forEach((card, cardIndex) => {
        if (card?.isTopic) return
        if (!card.topicId) return

        // Nếu topic này đã có topic card (từ API hoặc từ nơi khác) thì bỏ qua
        if (usedTopicIds.has(String(card.topicId))) return

        // Chèn topic card ngay sau lá bài này
        const insertPos = cardIndex + 1

        if (!topicPositions[card.topicId]) {
          topicPositions[card.topicId] = []
        }

        topicPositions[card.topicId].push({
          colIndex,
          insertPos,
        })
      })
    })

    // B2: clone layout để chèn topic card
    const nextLayout = layout.map(col => ({
      ...col,
      cards: [...(col.cards || [])],
    }))

    // B3: với mỗi topicId xuất hiện trong layout, chọn ngẫu nhiên 1 vị trí hợp lệ và chèn 1 topic card
    // Đảm bảo mỗi topicId chỉ được chèn đúng 1 lần
    Object.keys(topicPositions).forEach((topicId) => {
      const topicIdKey = String(topicId)
      
      // Kiểm tra lại xem topicId này đã có topic card chưa
      if (usedTopicIds.has(topicIdKey)) {
        console.warn(`[injectTopicCardsIntoLayout] TopicId ${topicIdKey} already has a topic card, skipping`)
        return
      }

      const positions = topicPositions[topicId]
      if (!positions || positions.length === 0) return

      // Chọn ngẫu nhiên 1 vị trí hợp lệ
      const randomIndex = Math.floor(Math.random() * positions.length)
      const { colIndex, insertPos } = positions[randomIndex]

      const col = nextLayout[colIndex]
      if (!col || !col.cards || col.cards.length === 0) return

      // Tìm card ở vị trí trước vị trí chèn để lấy topicName
      const belowIndex = Math.min(insertPos - 1, col.cards.length - 1)
      const below = col.cards[belowIndex]
      if (!below) return
      if (below?.isTopic) return

      // Kiểm tra lại xem trong cột này đã có topic card với topicId này chưa
      const hasTopicCardInCol = col.cards.some(card => card?.isTopic && String(card.topicId) === topicIdKey)
      if (hasTopicCardInCol) {
        console.warn(`[injectTopicCardsIntoLayout] Column ${colIndex} already has topic card for topicId ${topicIdKey}, skipping`)
        return
      }

      // Đánh dấu topicId này đã được sử dụng TRƯỚC KHI chèn
      usedTopicIds.add(topicIdKey)

      const topicCard = {
        id: `topic-${col.id}-${topicId}-${insertPos}-${Date.now()}`,
        topicId: topicIdKey, // Đảm bảo dùng string
        topicName: below.topicName,
        text: below.topicName || below.text,
        isTopic: true,
      }

      const safeInsertPos = Math.min(insertPos, col.cards.length)
      col.cards.splice(safeInsertPos, 0, topicCard)
    })

    // B4: Dedupe cứng lần cuối theo topicId trên TOÀN BỘ layout (phòng trường hợp data bất thường)
    // Đảm bảo mỗi topicId chỉ có đúng 1 topic card trong toàn bộ layout
    const seenTopicIds = new Set()
    const finalLayout = nextLayout.map((col) => {
      const nextCards = []
      ;(col.cards || []).forEach((card) => {
        if (card?.isTopic) {
          const topicIdKey = String(card.topicId ?? '')
          // Nếu topicId này đã xuất hiện ở cột khác, bỏ qua topic card này
          if (seenTopicIds.has(topicIdKey)) {
            console.warn(`[injectTopicCardsIntoLayout] Duplicate topic card detected for topicId: ${topicIdKey}, removing duplicate`)
            return // Bỏ qua topic card trùng lặp
          }
          seenTopicIds.add(topicIdKey)
        }
        nextCards.push(card)
      })
      return {
        ...col,
        cards: nextCards,
      }
    })

    return finalLayout
  }

  useEffect(() => {
    console.log('[SolitarePlayWeb] received level =', level)
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

  // Initialize background music
  useEffect(() => {
    if (!backgroundMusicRef.current) {
      backgroundMusicRef.current = new Audio(ThemeMusic)
      backgroundMusicRef.current.loop = true
      backgroundMusicRef.current.volume = 0.5 // Set volume to 50%
      
      // Try to play music (may require user interaction)
      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Auto-play was prevented, user needs to interact first
          console.log('Background music will play after user interaction')
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

  // Initialize tick sound effect
  useEffect(() => {
    if (!tickSoundRef.current) {
      tickSoundRef.current = new Audio(TickSound)
      tickSoundRef.current.volume = 0.7 // Set volume to 70%
    }

    return () => {
      if (tickSoundRef.current) {
        tickSoundRef.current = null
      }
    }
  }, [])

  // Initialize win sound effect
  useEffect(() => {
    if (!winSoundRef.current) {
      winSoundRef.current = new Audio(WinSound)
      winSoundRef.current.volume = 0.8 // Set volume to 80%
    }

    return () => {
      if (winSoundRef.current) {
        winSoundRef.current = null
      }
    }
  }, [])

  // Function to play tick sound effect
  const playTickSound = () => {
    if (tickSoundRef.current) {
      // Reset to start and play
      tickSoundRef.current.currentTime = 0
      const playPromise = tickSoundRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore play errors (may be blocked by browser)
        })
      }
    }
  }

  // Stop music when game ends or time runs out
  useEffect(() => {
    if ((isGameWon || timeLeft === 0) && backgroundMusicRef.current) {
      backgroundMusicRef.current.pause()
    } else if (!isGameWon && timeLeft > 0 && backgroundMusicRef.current) {
      // Resume music if game is still active
      const playPromise = backgroundMusicRef.current.play()
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Ignore play errors
        })
      }
    }
  }, [isGameWon, timeLeft])

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

  // Khi hết thời gian mà chưa hoàn thành game -> Game Over
  useEffect(() => {
    if (!isGameWon && timeLeft === 0 && !isGameOver) {
      setIsGameOver(true)
    }
  }, [timeLeft, isGameWon, isGameOver])

  useEffect(() => {
    const totalTopics = Object.keys(topicCardCounts).length
    const completedCount = completedColumnsRef.current.size

    if (totalTopics > 0 && completedCount === totalTopics && !isGameWon) {
      setIsGameWon(true)
      const timeBonus = Math.floor(timeLeft * TIME_BONUS_MULTIPLIER)
      const finalScore = score + timeBonus
      setScore(finalScore)

      // Stop background music
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause()
      }

      // Play win sound
      if (winSoundRef.current) {
        winSoundRef.current.currentTime = 0
        const playPromise = winSoundRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Ignore play errors
          })
        }
      }

      // Fire confetti
      const duration = 3 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

      const randomInRange = (min, max) => Math.random() * (max - min) + min

      const interval = setInterval(() => {
        const remaining = animationEnd - Date.now()

        if (remaining <= 0) {
          clearInterval(interval)
          // Stop win sound before navigating
          if (winSoundRef.current) {
            winSoundRef.current.pause()
          }
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

  const getEffectiveDragStartIndex = (columnIndex, startCardIndex) => {
    const col = columns[columnIndex]
    if (!col || startCardIndex < 0 || startCardIndex >= col.cards.length) return startCardIndex

    // If user clicks on a card ABOVE a topic card, and BELOW that topic card there are still hidden (unflipped) cards,
    // then we must allow moving the whole visible stack starting from the topic card (topic + cards above it).
    // Example: [hidden...][topic][flipped vocab][flipped vocab] -> click on flipped vocab => drag from topic.
    const topicIndex = col.cards
      .slice(0, startCardIndex)
      .map((c, i) => ({ c, i }))
      .filter(({ c }) => c?.isTopic)
      .map(({ i }) => i)
      .pop()

    if (topicIndex !== undefined) {
      const hasUnflippedBelowTopic = col.cards.slice(0, topicIndex).some(card => !flippedCards.has(card.id))
      const topicIsFlipped = flippedCards.has(col.cards[topicIndex].id)

      if (hasUnflippedBelowTopic && topicIsFlipped) {
        return topicIndex
      }
    }

    return startCardIndex
  }

  const getCardsToDrag = (columnIndex, startCardIndex) => {
    const col = columns[columnIndex]
    if (!col || startCardIndex < 0 || startCardIndex >= col.cards.length) return []

    const effectiveStartIndex = getEffectiveDragStartIndex(columnIndex, startCardIndex)
    return col.cards.slice(effectiveStartIndex)
  }

  const canDragCardsTogether = (cards, columnIndex, startCardIndex) => {
    if (cards.length === 0) return false
    
    if (columnIndex === null || columnIndex === undefined) return false
    const col = columns[columnIndex]
    if (!col) return false
    
    // Check if there are multiple flipped cards in a row starting from startCardIndex
    const flippedCardsFromIndex = col.cards.slice(startCardIndex).filter(card => flippedCards.has(card.id))
    
    // If there are 2 or more flipped cards, must move all flipped cards together
    if (flippedCardsFromIndex.length >= 2) {
      // Find the end index of consecutive flipped cards
      let endIndex = startCardIndex
      for (let i = startCardIndex; i < col.cards.length; i++) {
        if (flippedCards.has(col.cards[i].id)) {
          endIndex = i + 1
        } else {
          break
        }
      }
      
      // Must move all flipped cards from startCardIndex to endIndex
      const allFlippedCards = col.cards.slice(startCardIndex, endIndex)
      if (cards.length < allFlippedCards.length) {
        return false // Not moving all flipped cards
      }
    }
    
    // Check if any card has been correctly placed
    const hasPlacedCards = cards.some(card => placedCards.has(card.id))
    
    if (hasPlacedCards) {
      // If cards have been placed, check conditions
      
      // Get all placed cards from startCardIndex onwards
      const allPlacedCardsFromIndex = col.cards.slice(startCardIndex).filter(card => placedCards.has(card.id))
      
      // Check if there are unflipped cards below the cards being dragged
      const hasUnflippedCardsBelow = startCardIndex > 0 && 
        col.cards.slice(0, startCardIndex).some(card => !flippedCards.has(card.id))
      
      // If there are unflipped cards below, allow moving all placed cards above
      if (hasUnflippedCardsBelow) {
        // Must move all placed cards together (cannot move just one placed card)
        if (allPlacedCardsFromIndex.length > 0 && cards.length < allPlacedCardsFromIndex.length) {
          return false // Not moving all placed cards
        }
        
        // Normal logic: all cards must have same topicId
        if (cards.length === 1) return true
        const firstTopicId = cards[0].topicId
        return cards.every(card => card.topicId === firstTopicId)
      }
      
      // Check if column has topic card
      const hasTopicCard = col.cards.some(c => c.isTopic)
      
      // If column doesn't have topic card yet, allow moving all cards
      if (!hasTopicCard) {
        // Must move all cards together
        return cards.length === col.cards.length
      }
      
      // If column has topic card, only allow moving entire column if it only has 1 topic card
      const topicCardCount = col.cards.filter(c => c.isTopic).length
      // Only allow if column has exactly 1 topic card and we're moving all cards
      return topicCardCount === 1 && cards.length === col.cards.length
    }
    
    // Normal logic: all cards must have same topicId
    if (cards.length === 1) return true
    const firstTopicId = cards[0].topicId
    return cards.every(card => card.topicId === firstTopicId)
  }

  const isColumnLocked = (columnIndex) => {
    const col = columns[columnIndex]
    if (!col || col.cards.length === 0) return false
  
    const topicCard = col.cards.find(c => c.isTopic)
    if (!topicCard) return false
  
    const topicId = topicCard.topicId
    if (!topicId) return false
  
    // topic card phải ở đáy cột
    if (!col.cards[0]?.isTopic || String(col.cards[0].topicId) !== String(topicId)) {
      return false
    }
  
    // toàn bộ cards trong cột phải cùng topic
    const isHomogeneous = col.cards.every(c => String(c.topicId) === String(topicId))
    if (!isHomogeneous) return false
  
    const required = topicCardCounts[topicId]
    if (!required) return false
  
    const vocabCount = col.cards.filter(c => !c.isTopic).length
  
    return vocabCount === required
  }

  const markCardsPlaced = (cards) => {
    // Chỉ đánh dấu card đã được đặt đúng, KHÔNG cộng điểm ở đây nữa
    setPlacedCards(prev => {
      const newSet = new Set(prev)
      cards.forEach(card => newSet.add(card.id))
      return newSet
    })
  }

  const maybeAwardCompleteColumn = (columnIndex, nextCards) => {
    if (!nextCards || nextCards.length === 0) return

    // Check if topic card is at the bottom
    const topicCard = nextCards.find(c => c.isTopic)
    if (!topicCard) return

    // Topic card phải nằm ở đáy cột = đầu mảng
    if (nextCards[0].id !== topicCard.id) return

    const topicId = topicCard.topicId
    if (!topicId) return

    // Count vocabulary cards (excluding topic card)
    const vocabCards = nextCards.filter(c => !c.isTopic)
    const vocabCardCount = vocabCards.length

    const required = topicCardCounts[topicId]
    if (!required || vocabCardCount !== required) return

    // Check if all cards have the same topicId
    const isHomogeneous = nextCards.every(c => c.topicId === topicId)
    if (!isHomogeneous) return

    if (completedColumnsRef.current.has(columnIndex)) return

    completedColumnsRef.current.add(columnIndex)
    // Score = number of vocab cards × 10 (chỉ cộng điểm khi hoàn thành column)
    const pointsToAdd = vocabCardCount * SCORE_PER_CARD
    setScore(prev => prev + pointsToAdd)

    // Tạo hiệu ứng điểm bay lên từ column này
    const colEl = columnRefs.current[columnIndex]
    if (colEl) {
      const rect = colEl.getBoundingClientRect()
      const x = rect.left + rect.width / 2 + window.scrollX
      const y = rect.top + rect.height / 2 + window.scrollY
      const id = `${columnIndex}-${Date.now()}`
      setFloatingScores(prev => [...prev, { id, x, y, value: `+${pointsToAdd}` }])
    }
  }

  const handleMouseDown = (e, card, cardIndex, sourceIndex = null) => {
    // Không cho kéo khi game đã thắng hoặc đã hết giờ (game over)
    if (isGameWon || timeLeft === 0) return

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
      const effectiveStartIndex = getEffectiveDragStartIndex(colIdx, cardIndex)
      cardsToDrag = getCardsToDrag(colIdx, cardIndex)
      if (!canDragCardsTogether(cardsToDrag, colIdx, effectiveStartIndex)) {
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
      startCardIndex: isFromSlot ? cardIndex : (colIdx !== null ? getEffectiveDragStartIndex(colIdx, cardIndex) : cardIndex),
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
    // Play tick sound effect when card is placed in slot
    playTickSound()
    // No score for moving to slots as requested
  }

  const moveCardsToColumn = (fromColumnIndex, startCardIndex, toColumnIndex, cards) => {
    const targetCol = columns[toColumnIndex]
    const targetColTopCard = targetCol && targetCol.cards.length > 0 ? targetCol.cards[targetCol.cards.length - 1] : null
    
    // Check if cards are being placed correctly (matching topicId)
    const isCorrectPlacement = targetColTopCard && targetColTopCard.topicId === cards[0].topicId
    
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

    // Nếu đặt đúng chủ đề thì chỉ đánh dấu card là đã đặt đúng (không cộng điểm ở đây)
    if (isCorrectPlacement) {
      markCardsPlaced(cards)
    }
    
    // Play tick sound effect when card is placed
    playTickSound()
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
    const targetCol = columns[toColumnIndex]
    const targetColTopCard = targetCol && targetCol.cards.length > 0 ? targetCol.cards[targetCol.cards.length - 1] : null
    
    // Check if cards are being placed correctly (matching topicId)
    const isCorrectPlacement = targetColTopCard && targetColTopCard.topicId === cards[0].topicId

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

    // Nếu đặt đúng chủ đề thì chỉ đánh dấu card là đã đặt đúng (không cộng điểm ở đây)
    if (isCorrectPlacement) {
      markCardsPlaced(cards)
    }
    
    // Play tick sound effect when card is placed
    playTickSound()
  }

  const setSlotRef = (index, el) => { slotRefs.current[index] = el }
  const setCardRef = (cardId, el) => { cardRefs.current[cardId] = el }
  const setColumnRef = (index, el) => { columnRefs.current[index] = el }

  const handleGuide = () => {
    setRunTour(false)
  
    setTimeout(() => {
      setRunTour(true)
    }, 100)
  }

  const handleMenuClick = () => {
    playTickSound()
    setShowMenuPopup(true)
  }

  const handleContinue = () => {
    setShowMenuPopup(false)
  }

  const handleQuit = () => {
    setShowMenuPopup(false)
    if (onFinish) {
      onFinish(score, timeLeft)
    }
  }

  useEffect(() => {
    const seen = localStorage.getItem('solitaire-tour-seen')
  
    if (!seen) {
      const timer = setTimeout(() => {
        setRunTour(true)
        localStorage.setItem('solitaire-tour-seen', '1')
      }, 500)
  
      return () => clearTimeout(timer)
    }
  }, [])
  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <SolitarePlayWebHeader 
          timeLeft={timeLeft} 
          score={score} 
          isGameWon={isGameWon} 
          level={level}
          onMenuClick={handleMenuClick}
          onGuideClick={handleGuide}
        />
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

      <SolitarePlayWebTour
        run={runTour}
        onFinish={() => setRunTour(false)}
      />
      {/* Floating score animations */}
      {floatingScores.map((fs) => (
        <motion.div
          key={fs.id}
          initial={{ x: fs.x, y: fs.y, opacity: 1, scale: 1 }}
          animate={{ x: fs.x, y: fs.y - 80, opacity: 0, scale: 1.2 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            pointerEvents: 'none',
            zIndex: 1500,
            color: '#FFD54F',
            WebkitTextStroke: '1px #5D4037',
            fontSize: 28,
            fontWeight: 900,
            fontFamily: 'Epilogue, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}
          onAnimationComplete={() => {
            setFloatingScores(prev => prev.filter(p => p.id !== fs.id))
          }}
        >
          {fs.value}
        </motion.div>
      ))}

      {/* Menu Popup */}
      {showMenuPopup && (
        <MenuPopup onContinue={handleContinue} onQuit={handleQuit} />
      )}

      {/* Game Over Popup when time runs out and chưa hoàn thành game */}
      <SolitareGameOverPopup
        isOpen={isGameOver}
        onRestart={() => {
          if (typeof window !== 'undefined') {
            window.location.reload()
          }
        }}
        onClose={() => setIsGameOver(false)}
      />
    </div>
  )
}

// Menu Popup Component
function MenuPopup({ onContinue, onQuit }) {
  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
    },
    popup: {
      position: 'relative',
      backgroundImage: `url(${MenuBackground})`,
      backgroundSize: 'contain',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      width: '90%',
      maxWidth: 500,
      minHeight: 300,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: '40px 20px',
      paddingBottom: '60px',
      boxSizing: 'border-box',
    },
    buttonsContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      marginTop: 0,
      width: '70%',
      maxWidth: 300,
    },
    button: {
      padding: '15px 30px',
      fontSize: 18,
      fontWeight: 800,
      fontFamily: 'Epilogue, sans-serif',
      color: '#FFFFFF',
      backgroundColor: '#8B4513',
      border: '3px solid #654321',
      borderRadius: 12,
      cursor: 'pointer',
      textAlign: 'center',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
    },
    buttonHover: {
      backgroundColor: '#A0522D',
      transform: 'scale(1.05)',
    },
  }

  return (
    <div style={styles.overlay} onClick={onContinue}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        <div style={styles.buttonsContainer}>
          <button
            style={styles.button}
            onClick={onContinue}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor
              e.currentTarget.style.transform = styles.buttonHover.transform
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.button.backgroundColor
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Tiếp tục
          </button>
          <button
            style={styles.button}
            onClick={onQuit}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = styles.buttonHover.backgroundColor
              e.currentTarget.style.transform = styles.buttonHover.transform
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = styles.button.backgroundColor
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Thoát
          </button>
        </div>
      </div>
    </div>
  )
}

export default SolitarePlayWeb
