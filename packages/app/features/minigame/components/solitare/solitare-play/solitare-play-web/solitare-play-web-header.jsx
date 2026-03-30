import BannerSolitare from '../../../../../../../assets/BannerSolitare.png'
import MenuIcon from '../../../../../../../assets/menu-solitare.png'
import BackgroundClock from '../../../../../../../assets/backgroundClock.png'

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Styles for header component
const styles = {
  headerRow: {
    padding: '0px 100px',
    marginTop: '-50px',
    position: 'relative',
    top: '-10px',
  },
  headerContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 15,
  },
  timeBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    height: 60,
  },
  timeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    paddingTop: 20,
  },
  timeBackground: {
    width: 150,
    height: 60,
    objectFit: 'contain',
  },
  timeContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 7,
  },
  bannerWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: '0 0 auto',
  },
  bannerImage: {
    width: '100%',
    maxWidth: 300,
    height: 'auto',
    objectFit: 'contain',
  },
  bannerText: {
    position: 'absolute',
    top: '65%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 18,
    fontWeight: 800,
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  scoreBox: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    height: 60,
    paddingTop: 20,
  },
  scoreBackground: {
    width: 160,
    height: 60,
    objectFit: 'contain',
  },
  scoreContent: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 800,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    paddingTop: 26,
  },
  timeText: {
    fontSize: 15,
    fontWeight: 800,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  menuButton: {
    position: 'absolute',
    top: 80,
    right: 0,
    cursor: 'pointer',
    border: 'none',
    background: 'transparent',
    padding: 0,
    zIndex: 10,
    outline: 'none',
  },
  menuIcon: {
    width: 80,
    height: 'auto',
  },
  guideButton: {
    position: 'absolute',
    top: 140,
    right: 0,
    cursor: 'pointer',
    border: 'none',
    background: '#8B4513',
    color: '#fff',
    fontWeight: 700,
    fontSize: 14,
    padding: '8px 12px',
    borderRadius: 10,
    zIndex: 10,
  },
  soundButton: {
    cursor: 'pointer',
    border: 'none',
    background: '#fff7ea',
    color: '#222',
    fontWeight: 700,
    fontSize: 16,
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
  },
  soundButtonMuted: {
    color: '#b0bec5',
  },
}

export function SolitarePlayWebHeader({
  timeLeft,
  score,
  isGameWon = false,
  level = 'Easy',
  onMenuClick,
  onGuideClick,
  onToggleSound,
  isMuted = false,
}) {
  return (
    <div style={styles.headerRow}>
      <div style={styles.headerContainer}>
      <div style={styles.timeWrapper}>
        {onToggleSound && (
          <button
            style={{
              ...styles.soundButton,
              ...(isMuted ? styles.soundButtonMuted : null),
            }}
            onClick={onToggleSound}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        )}
        <div style={styles.timeBox} id="solitaire-timer" data-tour="solitaire-timer">
          <img src={BackgroundClock} alt="" style={styles.timeBackground} />
          <div style={styles.timeContent}>
            <span style={styles.timeText}>
              {isGameWon ? '🎉 Hoàn thành!' : formatTime(timeLeft)}
            </span>
          </div>
        </div>
      </div>

      <div style={styles.bannerWrapper}>
        <div style={styles.bannerWrapper} id="solitaire-level" data-tour="solitaire-level">
          <img src={BannerSolitare} alt="" style={styles.bannerImage} />
          <span style={styles.bannerText}>
            {isGameWon ? '🎊 Chiến thắng!' : `Level ${level}`}
          </span>
        </div>
      </div>

      <div style={styles.scoreBox} id="solitaire-score" data-tour="solitaire-score">
        <img src={BackgroundClock} alt="" style={styles.scoreBackground} />
        <div style={styles.scoreContent}>
          <span style={styles.scoreText}>{score}</span>
        </div>
      </div>

      {onMenuClick && (
        <button
          id="solitaire-menu"
          data-tour="solitaire-menu"
          style={styles.menuButton}
          onClick={onMenuClick}
          onMouseDown={(e) => e.preventDefault()}
          aria-label="Menu"
        >
          <img src={MenuIcon} alt="Menu" style={styles.menuIcon} />
        </button>
      )}
      {onGuideClick && (
        <button
          style={styles.guideButton}
          onClick={onGuideClick}
        >
          Cách Chơi
        </button>
      )}
      </div>
    </div>
  )
}

export default SolitarePlayWebHeader


