import BannerSolitare from '../../../../../../../assets/BannerSolitare.png'
import MenuIcon from '../../../../../../../assets/menu-solitare.png'

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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  bannerWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    minWidth: 100,
  },
  scoreBanner: {
    width: 160,
    height: 90,
    objectFit: 'contain',
  },
  scoreText: {
    position: 'absolute',
    top: '65%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: 14,
    fontWeight: 800,
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
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
    position: 'absolute',
    top: 200,
    right: 0,
    cursor: 'pointer',
    border: 'none',
    background: '#fff7ea',
    color: '#222',
    fontWeight: 700,
    fontSize: 16,
    width: 44,
    height: 44,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
    zIndex: 10,
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
      <div style={styles.timeBox} data-tour="solitaire-timer">
        <span style={styles.timeText}>
          {isGameWon ? '🎉 Hoàn thành!' : formatTime(timeLeft)}
        </span>
      </div>

      <div style={styles.bannerWrapper}>
        <div style={styles.bannerWrapper} data-tour="solitaire-level">
          <img src={BannerSolitare} alt="" style={styles.bannerImage} />
          <span style={styles.bannerText}>
            {isGameWon ? '🎊 Chiến thắng!' : `Level ${level}`}
          </span>
        </div>
      </div>

      <div style={styles.scoreBox} data-tour="solitaire-score">
        <img src={BannerSolitare} alt="" style={styles.scoreBanner} />
        <span style={styles.scoreText}>{score}</span>
      </div>

      {onMenuClick && (
        <button
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
      </div>
    </div>
  )
}

export default SolitarePlayWebHeader


