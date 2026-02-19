import TopicBg from '../../../../../../../assets/topic-solitare.png'
import CrownImg from '../../../../../../../assets/DrawVocab.png'

const WEB_CARD_WIDTH = 90
const WEB_CARD_HEIGHT = 144

const styles = {
  cardContainer: {
    position: 'relative',
    width: WEB_CARD_WIDTH,
    height: '100%',
    borderRadius: 12,
    overflow: 'visible',
  },
  cardImage: {
    width: WEB_CARD_WIDTH,
    height: '100%',
    borderRadius: 12,
    objectFit: 'cover',
    border: '1px solid rgb(163, 134, 94)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
  },
  crown: {
    position: 'absolute',
    top: -60,
    right: -22,
    width: 220,
    height: 'auto',
    transform: 'rotate(-43.8deg)',
    zIndex: 10,
    pointerEvents: 'none',
  },
  cardText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 16,
    fontWeight: 800,
    color: '#3E2723',
    fontFamily: 'Epilogue, sans-serif',
    zIndex: 2,
    textAlign: 'center',
    width: '90%',
  },
}

export function SolitarePlayWebTopicCard({ text, style = {} }) {
  return (
    <div style={{ ...styles.cardContainer, ...style }}>
      <img src={TopicBg} alt="Topic Background" style={styles.cardImage} />
      <img src={CrownImg} alt="Crown" style={styles.crown} />
      {text && <span style={styles.cardText}>{text}</span>}
    </div>
  )
}

export default SolitarePlayWebTopicCard

