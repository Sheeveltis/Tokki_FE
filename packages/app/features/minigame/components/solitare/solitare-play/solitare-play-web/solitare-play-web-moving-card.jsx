import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

import FrontImage from '../../../../../../../assets/front.png'
import BesideImage from '../../../../../../../assets/beside.png'
import LeafImage from '../../../../../../../assets/icon/decor/18.png'
import { SolitarePlayWebTopicCard } from './solitare-play-web-topic-card'

const WEB_CARD_WIDTH = 90
const WEB_CARD_HEIGHT = 144

const styles = {
  movingCard: {
    position: 'fixed',
    left: 0,
    top: 0,
    pointerEvents: 'none',
    zIndex: 1000,
  },
  cardInner: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: WEB_CARD_WIDTH,
    height: WEB_CARD_HEIGHT,
  },
  cardImage: {
    width: WEB_CARD_WIDTH,
    height: WEB_CARD_HEIGHT,
    borderRadius: 12,
    border: '2px solid #000',
    boxSizing: 'border-box',
    objectFit: 'cover',
  },
  leaf: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 22,
    height: 'auto',
    zIndex: 3,
  },
  cardText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 16,
    fontWeight: 800,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    zIndex: 2,
    textAlign: 'center',
    width: '90%',
  },
  stackedCard: {
    position: 'absolute',
    left: 0,
    width: WEB_CARD_WIDTH,
    height: WEB_CARD_HEIGHT,
  }
}

export function SolitarePlayWebMovingCard({ movingCard, onAnimationComplete, mousePos, isDragging }) {
  if (!movingCard || !movingCard.cards || movingCard.cards.length === 0) return null

  const hasTarget = movingCard.toX !== null && movingCard.toY !== null
  const isFromSlotToColumn = movingCard.isFromSlotToColumn || false
  
  // State for bounce animation sequence
  const [bounceStage, setBounceStage] = useState(0) // 0: initial, 1: bounce down, 2: final position
  
  useEffect(() => {
    // Reset bounce stage when dragging starts or when not from slot to column
    if (isDragging || !isFromSlotToColumn) {
      setBounceStage(0)
      return
    }
    
    // Only trigger bounce animation when dropping from slot to column
    if (isFromSlotToColumn && hasTarget && !isDragging) {
      // Stage 1: Bounce down
      setBounceStage(1)
      const timer1 = setTimeout(() => {
        // Stage 2: Move to final position
        setBounceStage(2)
        const timer2 = setTimeout(() => {
          onAnimationComplete()
        }, 400)
        return () => clearTimeout(timer2)
      }, 300)
      return () => clearTimeout(timer1)
    }
  }, [isFromSlotToColumn, hasTarget, isDragging, onAnimationComplete])
  
  // Vị trí: bám theo chuột nếu đang drag, bay tới đích nếu đã thả (hasTarget)
  const x = isDragging 
    ? mousePos.x - (movingCard.offsetX || WEB_CARD_WIDTH / 2) 
    : (hasTarget ? movingCard.toX - WEB_CARD_WIDTH / 2 : movingCard.fromX)
  
  // Calculate Y position with bounce effect
  let y = isDragging 
    ? mousePos.y - (movingCard.offsetY || 20) 
    : (hasTarget ? movingCard.toY - WEB_CARD_HEIGHT / 2 : movingCard.fromY)
  
  // Add bounce down effect for slot to column
  if (isFromSlotToColumn && hasTarget && !isDragging && bounceStage === 1) {
    y = y + 40 // Bounce down first
  }

  return (
    <motion.div
      style={styles.movingCard}
      initial={{ 
        x: movingCard.fromX, 
        y: movingCard.fromY, 
        scale: 1 
      }}
      animate={{ x, y, scale: isDragging ? 1.05 : 1 }}
      transition={hasTarget ? (() => {
        if (isFromSlotToColumn && bounceStage === 2) {
          // Final stage: spring to final position after bounce
          return {
            type: 'spring',
            stiffness: 300,
            damping: 20,
            mass: 0.6,
            onComplete: onAnimationComplete
          }
        } else if (isFromSlotToColumn && bounceStage === 1) {
          // Bounce down stage
          return {
            type: 'spring',
            stiffness: 400,
            damping: 15,
            mass: 0.6,
          }
        } else {
          // Normal column to column or other animations
          return {
            type: 'spring',
            stiffness: 250,
            damping: 25,
            mass: 1,
            onComplete: onAnimationComplete
          }
        }
      })() : {
        type: 'tween',
        duration: 0 // Đi theo chuột tức thì
      }}
    >
      <div style={{ position: 'relative' }}>
        {movingCard.cards.map((card, idx) => {
          const isTop = idx === movingCard.cards.length - 1
          const stackOffset = idx * 20 // Khoảng cách giữa các lá khi kéo stack (reduced proportionally)
          
          return (
            <div 
              key={card.id} 
              style={{
                ...styles.stackedCard,
                top: stackOffset,
                zIndex: idx
              }}
            >
              {card.isTopic ? (
                <SolitarePlayWebTopicCard text={card.text} />
              ) : (
                <>
                  <img src={FrontImage} alt="" style={styles.cardImage} />
                  <img src={LeafImage} alt="" style={styles.leaf} />
                  <span style={styles.cardText}>{card.text}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default SolitarePlayWebMovingCard
