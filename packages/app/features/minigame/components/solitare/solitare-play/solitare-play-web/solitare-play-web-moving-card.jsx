import React from 'react'
import { motion } from 'framer-motion'

import FrontImage from '../../../../../../../assets/front.png'
import BesideImage from '../../../../../../../assets/beside.png'
import LeafImage from '../../../../../../../assets/icon/decor/18.png'

const WEB_CARD_WIDTH = 100
const WEB_CARD_HEIGHT = 160

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
    borderRadius: 18,
    border: '2px solid #000',
    boxSizing: 'border-box',
    objectFit: 'cover',
  },
  leaf: {
    position: 'absolute',
    top: -11,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 25,
    height: 'auto',
    zIndex: 3,
  },
  cardText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 18,
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
  
  // Vị trí: bám theo chuột nếu đang drag, bay tới đích nếu đã thả (hasTarget)
  const x = isDragging 
    ? mousePos.x - (movingCard.offsetX || WEB_CARD_WIDTH / 2) 
    : (hasTarget ? movingCard.toX - WEB_CARD_WIDTH / 2 : movingCard.fromX)
  
  const y = isDragging 
    ? mousePos.y - (movingCard.offsetY || 20) 
    : (hasTarget ? movingCard.toY - WEB_CARD_HEIGHT / 2 : movingCard.fromY)

  return (
    <motion.div
      style={styles.movingCard}
      initial={{ 
        x: movingCard.fromX, 
        y: movingCard.fromY, 
        scale: 1 
      }}
      animate={{ x, y, scale: isDragging ? 1.05 : 1 }}
      transition={hasTarget ? {
        type: 'spring',
        stiffness: 250,
        damping: 25,
        mass: 1,
        onComplete: onAnimationComplete
      } : {
        type: 'tween',
        duration: 0 // Đi theo chuột tức thì
      }}
    >
      <div style={{ position: 'relative' }}>
        {movingCard.cards.map((card, idx) => {
          const isTop = idx === movingCard.cards.length - 1
          const stackOffset = idx * 30 // Khoảng cách giữa các lá khi kéo stack
          
          return (
            <div 
              key={card.id} 
              style={{
                ...styles.stackedCard,
                top: stackOffset,
                zIndex: idx
              }}
            >
              <img src={FrontImage} alt="" style={styles.cardImage} />
              <img src={LeafImage} alt="" style={styles.leaf} />
              <span style={styles.cardText}>{card.text}</span>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

export default SolitarePlayWebMovingCard
