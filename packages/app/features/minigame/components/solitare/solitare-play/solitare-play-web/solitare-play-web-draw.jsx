import React from 'react'

import DrawRecImage from '../../../../../../../assets/DrawRec.png'
import DrawVocabImage from '../../../../../../../assets/DrawVocab.png'
import LeafImage from '../../../../../../../assets/icon/decor/18.png'

// Constants - same size as column card
const WEB_CARD_WIDTH = 100
const WEB_CARD_HEIGHT = 160

// Styles for draw component
const styles = {
  drawWrapper: {
    position: 'relative',
    flexShrink: 0,
    top: '-10px',
  },
  drawRecImage: {
    width: 'auto',
    height: 'auto',
    maxWidth: 450,
    objectFit: 'contain',
    backgroundColor: 'transparent',
  },
  cardsContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  card: {
    width: WEB_CARD_WIDTH,
    height: WEB_CARD_HEIGHT,
    borderRadius: 18,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
  },
  cardLeft: {
    backgroundColor: 'rgba(255, 166, 77, 0.36)', // #FFA64D with 36% opacity
  },
  cardRight: {
    backgroundColor: 'rgba(255, 255, 255, 0.36)', // #FFFFFF with 36% opacity
  },
  leaf: {
    position: 'absolute',
    top: -25,
    width: 40,
    height: 40,
    zIndex: 2,
  },
  vocabImage: {
    width: 280,
    height: 280,
    objectFit: 'contain',
    marginTop: 8,
  },
}

export function SolitarePlayWebDraw() {
  return (
    <div style={styles.drawWrapper}>
      <img src={DrawRecImage} alt="" style={styles.drawRecImage} />
      <div style={styles.cardsContainer}>
        {/* Left card with DrawVocab */}
        <div style={{ ...styles.card, ...styles.cardLeft }}>
          <img src={LeafImage} alt="" style={styles.leaf} />
          <img src={DrawVocabImage} alt="" style={styles.vocabImage} />
        </div>
        {/* Right card - white */}
        <div style={{ ...styles.card, ...styles.cardRight }}>
          <img src={LeafImage} alt="" style={styles.leaf} />
        </div>
      </div>
    </div>
  )
}

export default SolitarePlayWebDraw

