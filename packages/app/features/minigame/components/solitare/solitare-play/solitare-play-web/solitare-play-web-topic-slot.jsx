import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import LeafImage from '../../../../../../../assets/icon/decor/18.png'
import FrontImage from '../../../../../../../assets/front.png'
import BesideImage from '../../../../../../../assets/beside.png'

// Constants - use same size as column card to keep format
const CARD_WIDTH = 100
const CARD_HEIGHT = 160

// Styles for ô tạm (temporary slot) component - peach card style
const styles = {
  topicSlot: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'relative',
    top: '10px',
  },
  slotWrapper: {
    position: 'relative',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: 0,
    padding: 0,
  },
  leafContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -18,
    zIndex: 2,
  },
  leaf: {
    width: 50,
    height: 40,
    objectFit: 'contain',
  },
  peachCard: {
    backgroundColor: '#FFE5D9',
    borderRadius: 18,
    border: '1px solid #D4A574',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    position: 'relative',
    boxSizing: 'border-box',
  },
  peachCardTemp: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  peachCardTopic: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  slotText: {
    fontSize: 16,
    fontWeight: 600,
    color: '#3E2723',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    lineHeight: 1.2,
    marginTop: 8,
  },
  cardStack: {
    position: 'relative',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    top: '21px',
  },
  stackedCard: {
    marginTop: -160.2, // Match column card stacking offset
  },
  cardImage: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 18,
    objectFit: 'cover',
    border: '1px solid rgb(163, 134, 94)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    boxSizing: 'border-box',
    display: 'block',
  },
  cardText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontWeight: 800,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    zIndex: 2,
    textAlign: 'center',
    width: '90%',
  },
  cardTextStyle: {
    fontSize: 18,
  },
  leafImage: {
    position: 'absolute',
    top: -18,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 35,
    height: 'auto',
    zIndex: 3,
    pointerEvents: 'none',
  },
  cardsTextList: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 10,
    fontWeight: 600,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    zIndex: 3,
    textAlign: 'center',
    width: '90%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: '3px 5px',
    borderRadius: 4,
    maxHeight: '50px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    lineHeight: 1.1,
  },
  leafBetweenCards: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 28,
    height: 'auto',
    zIndex: 4,
    pointerEvents: 'none',
  },
  celebrate: {
    position: 'absolute',
    top: -10,
    right: 10,
    fontSize: 20,
    zIndex: 10,
  },
}

export function SolitarePlayWebTopicSlot({ 
  slot, 
  index, 
  setSlotRef, 
  celebrate, 
  isTempSlot = false,
  onMouseDown,
  flippedCards,
  isMoving, // Prop mới để biết card trong slot này đang được kéo
}) {
  const hasCards = slot.cards && slot.cards.length > 0
  const hasTopic = !!slot.topicId

  const handleCardMouseDown = (e, card, cardIndex) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (onMouseDown) {
      // Pass slot index as negative to indicate it's from a slot
      onMouseDown(e, card, cardIndex, -index - 1)
    }
  }

  return (
    <div style={styles.topicSlot}>
      <div
        ref={(r) => {
          if (r) setSlotRef(index, r)
        }}
        style={{
          ...styles.slotWrapper,
          opacity: isMoving ? 0 : 1,
        }}
      >
        {hasCards ? (
          <>
            {/* Leaf container only for empty slot, card already has leaf */}
          </>
        ) : (
          /* Single leaf on top for empty slot */
          <div style={styles.leafContainer}>
            <img src={LeafImage} alt="" style={styles.leaf} />
          </div>
        )}
        
        {hasCards ? (
          /* Show cards if any - keep same size as column card */
          <div style={styles.cardStack}>
            {slot.cards.map((card, cardIndex) => {
              const isTop = cardIndex === slot.cards.length - 1
              const isFlipped = flippedCards && flippedCards.has(card.id)
              // Card đã lật sẽ hiển thị FrontImage, không lật lại
              const showFront = isTop || isFlipped
              const isStacked = cardIndex > 0
              
              return (
                <div
                  key={card.id}
                  style={{
                    position: 'relative',
                    ...(isStacked ? styles.stackedCard : {}),
                  }}
                >
                  <img
                    src={showFront ? FrontImage : BesideImage}
                    alt=""
                    style={styles.cardImage}
                  />
                  {/* Leaf icon on top card */}
                  {isTop && (
                    <img
                      src={LeafImage}
                      alt=""
                      style={styles.leafImage}
                    />
                  )}
                  {/* Leaf between cards - show between stacked cards */}
                  {isStacked && (
                    <img
                      src={LeafImage}
                      alt=""
                      style={styles.leafBetweenCards}
                    />
                  )}
                  {/* Text hiển thị cho card đã lật */}
                  {showFront && (
                    <>
                      {/* Text list of all cards at the top - show all cards' text when stacked */}
                      {isTop && slot.cards.length > 1 && (
                        <div style={styles.cardsTextList}>
                          {slot.cards.map((c) => (
                            <span key={c.id} style={{ fontSize: 9, lineHeight: 1.1 }}>
                              {c.text}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Text cho card bị đè - đẩy lên trên đầu (dưới lá) */}
                      {/* Chỉ đẩy lên khi bị đè (isStacked) và đã lật, nhưng không phải top card */}
                      {isStacked && isFlipped && !isTop && (
                        <span style={{
                          ...styles.cardText,
                          top: '20%',
                          fontSize: 12,
                          transform: 'translate(-80%, 0)',
                        }}>{card.text}</span>
                      )}
                      {/* Text ở giữa cho: top card hoặc card đã lật nhưng không bị đè */}
                      {(isTop || (isFlipped && !isStacked)) && (
                        <span style={{
                          ...styles.cardText,
                          ...styles.cardTextStyle,
                        }}>{card.text}</span>
                      )}
                    </>
                  )}
                  {/* Make card draggable if it's the top card */}
                  {isTop && (
                    <div
                      onMouseDown={(e) => handleCardMouseDown(e, card, cardIndex)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        cursor: 'grab',
                        zIndex: 5,
                      }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          /* Empty slot - show placeholder */
          <div style={{
            ...styles.peachCard,
            ...(isTempSlot ? styles.peachCardTemp : styles.peachCardTopic),
          }}>
            <span style={styles.slotText}>
              {isTempSlot ? 'Ô tạm' : hasTopic ? slot.name : 'Ô trống'}
            </span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {celebrate ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.4 }}
            style={styles.celebrate}
          >
            ✨
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export default SolitarePlayWebTopicSlot


