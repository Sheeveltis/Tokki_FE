import React from 'react'

import BannerSolitare from '../../../../../../../assets/BannerSolitare.png'

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
}

export function SolitarePlayWebHeader({ timeLeft, score, isGameWon = false, level = 'Easy' }) {
  return (
    <div style={styles.headerRow}>
      <div style={styles.headerContainer}>
        <div style={styles.timeBox}>
          <span style={styles.timeText}>
            {isGameWon ? '🎉 Hoàn thành!' : formatTime(timeLeft)}
          </span>
        </div>

        <div style={styles.bannerWrapper}>
          <img src={BannerSolitare} alt="" style={styles.bannerImage} />
          <span style={styles.bannerText}>
            {isGameWon ? '🎊 Chiến thắng!' : `Level ${level}`}
          </span>
        </div>

        <div style={styles.scoreBox}>
          <img src={BannerSolitare} alt="" style={styles.scoreBanner} />
          <span style={styles.scoreText}>{score}</span>
        </div>
      </div>
    </div>
  )
}

export default SolitarePlayWebHeader


