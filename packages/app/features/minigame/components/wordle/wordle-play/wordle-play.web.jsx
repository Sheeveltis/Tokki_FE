import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, ImageBackground, Pressable, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { WordleInputBar } from './components/WordleInputBar'
import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'

// Mock data
const TARGET_WORD = '한국어'
const WORD_LENGTH = TARGET_WORD.length
const MAX_GUESSES = 6
const TOPIC_NAME = '의국'

// Ký tự tiếng Hàn ngẫu nhiên để lấp đầy bàn phím
const RANDOM_KOREAN_CHARS = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '고', '노', '도', '로']

export function WordlePlayWeb() {
  const router = useRouter()
  const [guesses, setGuesses] = useState([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [gameState, setGameState] = useState('playing') // 'playing', 'won', 'lost'
  const [sentence, setSentence] = useState('')
  const [isSentenceSubmitted, setIsSentenceSubmitted] = useState(false)
  
  // Tạo bàn phím ngẫu nhiên bao gồm các ký tự của TARGET_WORD
  const keyboardKeys = useMemo(() => {
    const targetChars = TARGET_WORD.split('')
    const needed = 20 - targetChars.length
    const pool = RANDOM_KOREAN_CHARS.filter(c => !targetChars.includes(c))
    const randoms = []
    for (let i = 0; i < needed; i++) {
      const idx = Math.floor(Math.random() * pool.length)
      randoms.push(pool.splice(idx, 1)[0])
    }
    return [...targetChars, ...randoms].sort(() => Math.random() - 0.5)
  }, [])

  const handleKeyClick = (key) => {
    if (gameState !== 'playing') return

    if (key === 'Xóa') {
      setCurrentGuess(prev => prev.slice(0, -1))
    } else if (key === 'Gửi') {
      handleSubmit()
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess(prev => prev + key)
    }
  }

  // Hỗ trợ bàn phím vật lý
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'playing') return

      if (e.key === 'Backspace') {
        handleKeyClick('Xóa')
      } else if (e.key === 'Enter') {
        handleKeyClick('Gửi')
      } else {
        // Kiểm tra xem phím gõ có nằm trong bàn phím ảo không
        if (keyboardKeys.includes(e.key)) {
          handleKeyClick(e.key)
        }
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      if (Platform.OS === 'web') {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [gameState, currentGuess, keyboardKeys])

  const handleSubmit = () => {
    if (gameState !== 'playing') return
    if (currentGuess.length !== WORD_LENGTH) return

    const newGuesses = [...guesses, currentGuess]
    setGuesses(newGuesses)
    setCurrentGuess('')

    if (currentGuess === TARGET_WORD) {
      setGameState('won')
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState('lost')
    }
  }

  const handleSentenceSubmit = () => {
    if (!sentence.trim()) {
      message.error('Vui lòng nhập câu văn của bạn!')
      return
    }
    setIsSentenceSubmitted(true)
  }

  // Tính toán trạng thái của từng ô chữ trong các lượt đoán
  const statuses = useMemo(() => {
    return guesses.map((guess) => {
      const result = Array(WORD_LENGTH).fill('absent')
      const targetArr = TARGET_WORD.split('')
      const guessArr = guess.split('')

      // Bước 1: Check đúng vị trí (correct)
      guessArr.forEach((char, i) => {
        if (char === targetArr[i]) {
          result[i] = 'correct'
          targetArr[i] = null
        }
      })

      // Bước 2: Check đúng chữ sai vị trí (present)
      guessArr.forEach((char, i) => {
        if (result[i] !== 'correct' && targetArr.includes(char)) {
          result[i] = 'present'
          targetArr[targetArr.indexOf(char)] = null
        }
      })

      return result
    })
  }, [guesses])

  // Trạng thái bàn phím dựa trên tất cả các lượt đoán
  const keyStatuses = useMemo(() => {
    const map = {}
    guesses.forEach((guess, i) => {
      const rowStatuses = statuses[i]
      guess.split('').forEach((char, j) => {
        const currentStatus = map[char]
        const newStatus = rowStatuses[j]

        if (newStatus === 'correct') {
          map[char] = 'correct'
        } else if (newStatus === 'present' && currentStatus !== 'correct') {
          map[char] = 'present'
        } else if (newStatus === 'absent' && !currentStatus) {
          map[char] = 'absent'
        }
      })
    })
    return map
  }, [guesses, statuses])

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Wordle</Text>
          <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backText}>← Trở lại</Text>
          </Pressable>
        </View>

        <View style={styles.content}>
          <WordleGrid
            guesses={[...guesses, currentGuess]}
            statuses={statuses}
            maxGuesses={MAX_GUESSES}
            wordLength={WORD_LENGTH}
          />

          {gameState === 'playing' && (
            <WordleKeyboard
              keys={keyboardKeys}
              keyStatuses={keyStatuses}
              onPress={handleKeyClick}
            />
          )}

          {gameState === 'won' && !isSentenceSubmitted && (
            <View style={styles.sentenceBox}>
              <Text style={styles.sentenceTitle}>Bạn đã đoán đúng từ: {TARGET_WORD}</Text>
              <Text style={styles.sentenceSubtitle}>Hãy đặt một câu với từ này để ghi điểm:</Text>
              <WordleInputBar
                value={sentence}
                onChange={setSentence}
                onSubmit={handleSentenceSubmit}
                maxLength={100}
              />
              <Pressable style={styles.submitSentenceBtn} onPress={handleSentenceSubmit}>
                <Text style={styles.submitSentenceText}>Gửi câu văn</Text>
              </Pressable>
            </View>
          )}

          {(gameState === 'lost' || (gameState === 'won' && isSentenceSubmitted)) && (
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>
                {gameState === 'won' ? '🎉 Chúc mừng bạn đã hoàn thành thử thách!' : `😢 Rất tiếc! Từ đúng là: ${TARGET_WORD}`}
              </Text>
              {gameState === 'won' && (
                <Text style={styles.finalSentence}>Câu văn của bạn: "{sentence}"</Text>
              )}
              <Pressable style={styles.restartBtn} onPress={() => {
                setGuesses([])
                setGameState('playing')
                setCurrentGuess('')
                setSentence('')
                setIsSentenceSubmitted(false)
              }}>
                <Text style={styles.restartText}>Chơi lại</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    position: 'relative',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1b',
    letterSpacing: 2,
  },
  topic: {
    fontSize: 18,
    color: '#444',
    marginTop: 5,
    fontWeight: '600',
  },
  backBtn: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#F1BE4B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backText: {
    fontWeight: '700',
    fontSize: 14,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sentenceBox: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 500,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  sentenceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6aaa64',
    marginBottom: 5,
  },
  sentenceSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  submitSentenceBtn: {
    backgroundColor: '#6aaa64',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  submitSentenceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 20,
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  finalSentence: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  restartBtn: {
    backgroundColor: '#7FA14D',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  restartText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})


export default WordlePlayWeb

