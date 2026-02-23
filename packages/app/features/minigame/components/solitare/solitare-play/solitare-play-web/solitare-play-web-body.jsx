import React from 'react'

import { SolitarePlayWebTopicSlot } from './solitare-play-web-topic-slot'
import { SolitarePlayWebColumnCard } from './solitare-play-web-column-card'
import { SolitarePlayWebDraw } from './solitare-play-web-draw'

// Styles for body component
const styles = {
  bodyWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  },
  board: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 30,
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  topSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 60,
    marginTop: 4,
    gap: 15,
    flexShrink: 0,
    height: 'auto',
    maxHeight: '140px',
  },
  topicRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
    flex: 1,
  },
  columnsRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    gap: 8,
    marginTop: 10,
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px dashed rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'visible',
    paddingTop: 10,
  },
}

export function SolitarePlayWebBody({
  slots,
  columns,
  draggedCards,
  celebrateSlot,
  movingCard,
  flippedCards,
  setSlotRef,
  setCardRef,
  setColumnRef,
  onMouseDown,
}) {
  // First 4 slots are temporary slots
  const tempSlots = slots.slice(0, 4)

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.board}>
        {/* Top section: DrawRec on left, 4 temp slots on right */}
        <div style={styles.topSection}>
          {/* DrawRec with 2 cards */}
          <SolitarePlayWebDraw />

          {/* 4 temporary slots */}
          <div style={styles.topicRow}>
            {tempSlots.map((slot, index) => (
              <div
                key={`temp-slot-${index}`}
                data-slot-index={index}
              >
                <SolitarePlayWebTopicSlot
                  slot={slot}
                  index={index}
                  setSlotRef={setSlotRef}
                  celebrate={celebrateSlot === index}
                  isTempSlot={true}
                  onMouseDown={onMouseDown}
                  flippedCards={flippedCards}
                  isMoving={
                    (draggedCards && draggedCards.isFromSlot && draggedCards.slotIndex === index) ||
                    (movingCard && movingCard.targetType === 'slot' && movingCard.targetIndex === index)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div style={styles.columnsRow}>
          {columns.map((column, colIndex) => {
            // Calculate card height: only reduce when too many cards, keep default size when few cards
            const cardCount = column.cards.length
            const DEFAULT_CARD_HEIGHT = 144 // Match temporary slot size
            const MAX_CARDS_BEFORE_SHRINK = 8 // Only shrink if more than this many cards
            
            let maxCardHeight = `${DEFAULT_CARD_HEIGHT}px`
            
            if (cardCount > MAX_CARDS_BEFORE_SHRINK) {
              // Only reduce height when there are too many cards
              const stackOffset = 122 // Card overlap offset (reduced proportionally)
              const totalOverlap = (cardCount - 1) * stackOffset
              const availableHeight = `calc(100% - 20px)` // Reserve padding
              maxCardHeight = `calc((${availableHeight} + ${totalOverlap}px) / ${cardCount})`
            }
            
            return (
              <div
                key={column.id}
                style={styles.column}
                data-column-index={colIndex}
                ref={(r) => {
                  if (r) setColumnRef(colIndex, r)
                }}
              >
                {column.cards.map((card, cardIndex) => {
                const isTop = cardIndex === column.cards.length - 1
                
                // Xác định card có đang được kéo hoặc đang animate không
                const isBeingDragged = draggedCards && 
                  !draggedCards.isFromSlot &&
                  draggedCards.columnIndex === colIndex && 
                  cardIndex >= draggedCards.startCardIndex
                
                const isAnimateMoving = movingCard && movingCard.cards?.some(c => c.id === card.id)

                  return (
                    <SolitarePlayWebColumnCard
                      key={card.id}
                      card={{ ...card, columnIndex: colIndex }}
                      cardIndex={cardIndex}
                      isTop={isTop}
                      isSelected={false}
                      isMoving={!!isBeingDragged || !!isAnimateMoving}
                      stacked={cardIndex !== 0}
                      isFlipped={flippedCards.has(card.id)}
                      setCardRef={setCardRef}
                      onMouseDown={(e, c, idx) => onMouseDown(e, c, idx, colIndex)}
                      maxHeight={maxCardHeight}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default SolitarePlayWebBody
