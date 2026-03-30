import React from 'react'

import { SolitarePlayWebTopicSlot } from './solitare-play-web-topic-slot'
import { SolitarePlayWebColumnCard } from './solitare-play-web-column-card'
import { SolitarePlayWebDraw } from './solitare-play-web-draw'
import BackgroundColumn from '../../../../../../../assets/BackgroundColumn.png'

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
    marginBottom: 30,
    marginTop: 30,
    gap: 15,
    flexShrink: 0,
    height: 'auto',
    maxHeight: '140px',
  },
  topicRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
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
    gap: 5,
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
  
    backgroundImage: `url(${BackgroundColumn})`,
    backgroundSize: '100% 100%',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
  
    position: 'relative',
    overflow: 'visible',
    paddingTop: 50,
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
  collapsingColumns = [],
  hiddenCompletedColumns = [],
}) {
  const tempSlots = slots.slice(0, 4)

  return (
    <div style={styles.bodyWrapper}>
      <div style={styles.board}>
        <div style={styles.topSection}>
        <div
          id="solitaire-draw"
          data-tour="solitaire-draw"
          style={{ top: -23, position: 'relative' }}
        >
          <SolitarePlayWebDraw />
        </div>

          <div style={styles.topicRow}>
            <div
              id="solitaire-temp-slots"
              data-tour="solitaire-temp-slots"
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: 15,
                justifyContent: 'flex-end',
              }}
            >
              {tempSlots.map((slot, index) => (
                <div key={`temp-slot-${index}`} data-slot-index={index}>
                  <SolitarePlayWebTopicSlot
                    slot={slot}
                    index={index}
                    setSlotRef={setSlotRef}
                    celebrate={celebrateSlot === index}
                    isTempSlot={true}
                    onMouseDown={onMouseDown}
                    flippedCards={flippedCards}
                    isMoving={
                      (draggedCards &&
                        draggedCards.isFromSlot &&
                        draggedCards.slotIndex === index) ||
                      (movingCard &&
                        movingCard.targetType === 'slot' &&
                        movingCard.targetIndex === index)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.columnsRow} id="solitaire-columns" data-tour="solitaire-columns">
          {columns.map((column, colIndex) => {
            const isCollapsing = collapsingColumns.some(
              (item) => item.columnIndex === colIndex
            )
            const isHiddenCompleted = hiddenCompletedColumns.includes(colIndex)
            const cardCount = column.cards.length
            const DEFAULT_CARD_HEIGHT = 144
            const MAX_CARDS_BEFORE_SHRINK = 8

            let maxCardHeight = `${DEFAULT_CARD_HEIGHT}px`

            if (cardCount > MAX_CARDS_BEFORE_SHRINK) {
              const stackOffset = 122
              const totalOverlap = (cardCount - 1) * stackOffset
              const availableHeight = `calc(100% - 20px)`
              maxCardHeight = `calc((${availableHeight} + ${totalOverlap}px) / ${cardCount})`
            }

            return (
              <div
                key={column.id}
                style={{
                  ...styles.column,
                  opacity: isHiddenCompleted ? 0 : isCollapsing ? 0.15 : 1,
                  pointerEvents: isCollapsing ? 'none' : 'auto',
                  transition: 'opacity 0.2s ease',
                }}
                data-column-index={colIndex}
                ref={(r) => {
                  if (r) setColumnRef(colIndex, r)
                }}
              >
                {column.cards.map((card, cardIndex) => {
                  const isTop = cardIndex === column.cards.length - 1

                  const isBeingDragged =
                    draggedCards &&
                    !draggedCards.isFromSlot &&
                    draggedCards.columnIndex === colIndex &&
                    cardIndex >= draggedCards.startCardIndex

                  const isAnimateMoving =
                    movingCard && movingCard.cards?.some((c) => c.id === card.id)

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