import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BunnyGameOver from '../../../../../../../assets/bunny/1.png' // Sử dụng bunny hiện có hoặc asset tương tự

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  container: {
    width: 450,
    backgroundColor: '#F5F2E8',
    borderRadius: 24,
    padding: '40px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    cursor: 'pointer',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    background: 'none',
    border: 'none',
  },
  bunnyImg: {
    width: 180,
    height: 'auto',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1C1C1C',
    marginBottom: 30,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  restartBtn: {
    backgroundColor: '#8B9D52',
    color: 'white',
    border: 'none',
    borderRadius: 30,
    padding: '12px 40px',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'Epilogue, sans-serif',
    boxShadow: '0 4px 0px #6D7A39',
  }
}

export function SolitareGameOverPopup({ isOpen, onRestart, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            style={styles.container}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button style={styles.closeBtn} onClick={onClose}>✕</button>
            
            <img src={BunnyGameOver} alt="Bunny" style={styles.bunnyImg} />
            
            <h2 style={styles.title}>Bạn đã thua mất rồiiii</h2>
            
            <button 
              style={styles.restartBtn} 
              onClick={onRestart}
              onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
            >
              Chơi lại
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

