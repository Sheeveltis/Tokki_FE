import React from 'react'
import { motion } from 'framer-motion'

import FrontImage from '../../../../../../../assets/front.png'
import BesideImage from '../../../../../../../assets/beside.png'
import LeafImage from '../../../../../../../assets/icon/decor/18.png'
import { SolitarePlayWebTopicCard } from './solitare-play-web-topic-card'

// Constants - match temporary slot size
const WEB_CARD_WIDTH = 90
const WEB_CARD_HEIGHT = 144
const CARD_STACK_OFFSET = 122 // Overlap between stacked cards (reduced proportionally)

// Styles for column card component
const styles = {
  cardWrapper: {
    marginBottom: 5,
    cursor: 'pointer',
  },
  cardStacked: {
    marginTop: -CARD_STACK_OFFSET, // Giảm độ chồng lấp để lộ ra 35px thay vì 25px
  },
  cardImage: {
    width: WEB_CARD_WIDTH,
    height: WEB_CARD_HEIGHT,
    borderRadius: 12,
    objectFit: 'cover',
    border: '1px solid rgb(163, 134, 94)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    backgroundColor: '#fff',
  },
  cardText: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: 16,
    fontWeight: 800,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    zIndex: 2,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    width: '90%',
  },
  leafImage: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 22,
    height: 'auto',
    zIndex: 3,
    pointerEvents: 'none',
  },
}

export function SolitarePlayWebColumnCard({
  card,
  cardIndex,
  isTop,
  isSelected,
  isMoving,
  stacked,
  isFlipped,
  setCardRef,
  onMouseDown,
  maxHeight,
}) {
  const handleMouseDown = (e) => {
    if (!isTop && !isFlipped) return
    
    if (onMouseDown) {
      onMouseDown(e, card, cardIndex)
    }
  }

  const showFront = isTop || isFlipped
  const canDrag = isTop || isFlipped
  
  // Calculate dynamic card height based on maxHeight prop
  const cardHeight = maxHeight || `${WEB_CARD_HEIGHT}px`
  const cardStyle = {
    ...styles.cardWrapper,
    ...(stacked ? styles.cardStacked : {}),
    position: 'relative',
    opacity: isMoving ? 0 : 1,
    pointerEvents: isMoving ? 'none' : (canDrag ? 'auto' : 'none'),
    cursor: canDrag ? 'grab' : 'default',
    height: cardHeight,
    maxHeight: cardHeight,
  }

  if (card.isTopic) {
    return (
      <motion.div
        key={card.id}
        ref={(r) => {
          if (r) setCardRef(card.id, r)
        }}
        data-column-index={card.columnIndex}
        data-card-index={cardIndex}
        style={cardStyle}
        onMouseDown={handleMouseDown}
        whileHover={canDrag && !isMoving ? { scale: 1.02 } : undefined}
        layout={false}
      >
        <SolitarePlayWebTopicCard text={showFront ? card.text : ''} style={{ height: '100%' }} />
      </motion.div>
    )
  }

  return (
    <motion.div
      key={card.id}
      ref={(r) => {
        if (r) setCardRef(card.id, r)
      }}
      data-column-index={card.columnIndex}
      data-card-index={cardIndex}
      style={cardStyle}
      onMouseDown={handleMouseDown}
      whileHover={canDrag && !isMoving ? { scale: 1.02 } : undefined}
      layout={false}
    >
      <img
        src={showFront ? FrontImage : BesideImage}
        alt=""
        style={{
          ...styles.cardImage,
          height: '100%',
          maxHeight: cardHeight,
        }}
      />
      <img
        src={LeafImage}
        alt=""
        style={styles.leafImage}
      />
      {showFront && (
        <span style={{
          ...styles.cardText,
          ...(isTop ? {
            top: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 16,
          } : {
            top: '10px', // Đưa text lên sát đầu card bị đè
            fontSize: 12, // Thu nhỏ lại một chút để vừa khoảng trống
            padding: '1px 4px',
            borderRadius: '4px',
          }),
        }}>{card.text}</span>
      )}
    </motion.div>
  )
}

export default SolitarePlayWebColumnCard


