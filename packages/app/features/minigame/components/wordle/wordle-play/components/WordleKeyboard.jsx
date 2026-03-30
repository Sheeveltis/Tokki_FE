import { useMemo } from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { motion } from 'framer-motion'

// Layout bàn phím Hangul chuẩn với các jamo
const HANGUL_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅆ', 'ㄲ', 'ㄸ', 'ㅉ', 'ㅃ'],
]

export function WordleKeyboard({ rows = [], onKeyPress }) {
  // Tính trạng thái từng phím dựa trên feedbacks từ API
  const keyStatuses = useMemo(() => {
    const map = {}
    rows.forEach((row) => {
      row.forEach((fb) => {
        const { character, blockColor } = fb || {}
        if (!character) return
        const color = (blockColor || '').toLowerCase()
        if (color === 'green') {
          map[character] = 'correct'
        } else if (color === 'yellow' && map[character] !== 'correct') {
          map[character] = 'present'
        } else if (color === 'gray' && !map[character]) {
          map[character] = 'absent'
        }
      })
    })
    return map
  }, [rows])
  const renderKey = (key) => {
    const status = keyStatuses?.[key]
    let keyStyle = [styles.key]
          let textStyle = styles.keyText

          if (key === 'Gửi') {
            keyStyle = [styles.key, styles.submitKey]
          } else if (key === 'Xóa') {
            keyStyle = [styles.key, styles.deleteKey]
          }

          if (status === 'correct') {
      keyStyle = [...keyStyle, styles.correct]
            textStyle = [styles.keyText, styles.whiteText]
          } else if (status === 'present') {
      keyStyle = [...keyStyle, styles.present]
            textStyle = [styles.keyText, styles.whiteText]
          } else if (status === 'absent') {
      keyStyle = [...keyStyle, styles.absent]
            textStyle = [styles.keyText, styles.whiteText]
          }

    const handleKeyClick = () => {
      if (!onKeyPress) return
      if (key === 'Xóa') {
        onKeyPress('BACKSPACE')
      } else if (key === 'Gửi') {
        onKeyPress('ENTER')
      } else {
        onKeyPress(key)
      }
    }

    if (Platform.OS === 'web') {
      return (
        <motion.div
          key={key}
          style={{
            ...styles.key,
            ...(key === 'Gửi' && styles.submitKey),
            ...(key === 'Xóa' && styles.deleteKey),
            ...(status === 'correct' && styles.correct),
            ...(status === 'present' && styles.present),
            ...(status === 'absent' && styles.absent),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          whileTap={{ 
            y: 3,
            boxShadow: '0 1px 0 rgba(0,0,0,0.2)',
          }}
          onClick={handleKeyClick}
          onMouseDown={(e) => {
            // Giữ focus ở hidden IME input (tránh blur khi click bàn phím ảo)
            // + ngăn text selection trên web
            e.preventDefault()
          }}
        >
          <Text 
            style={[textStyle, { textAlign: 'center' }]}
            selectable={false}
          >
            {key}
          </Text>
        </motion.div>
      )
    }

    // Fallback cho React Native
          return (
      <View
        key={key}
        style={keyStyle}
        onTouchStart={handleKeyClick}
      >
        <Text 
          style={textStyle}
          selectable={false}
        >
          {key}
        </Text>
      </View>
          )
  }

  // Chia thành 3 hàng ngang
  const row1 = HANGUL_ROWS[0]
  const row2 = HANGUL_ROWS[1]
  const row3 = [...HANGUL_ROWS[2], 'Xóa', 'Gửi']

  return (
    <View style={styles.keyboard}>
      <View style={styles.row}>
        {row1.map(renderKey)}
      </View>
      <View style={styles.row}>
        {row2.map(renderKey)}
      </View>
      <View style={styles.row}>
        {row3.map(renderKey)}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  keyboard: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 10,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  key: {
    minWidth: 42,
    height: 52,
    backgroundColor: '#FFF9E3', // Soft cream/pastel
    borderRadius: 14, // Bubbly
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      boxShadow: '0 4px 0 #EAD7AE, 0 6px 8px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.05s ease',
    }),
  },
  submitKey: {
    minWidth: 70,
    backgroundColor: '#4CAF50', // Friendly Green
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  deleteKey: {
    minWidth: 70,
    backgroundColor: '#EF5350', // Soft earthy red
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #C62828, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  correct: {
    backgroundColor: '#4CAF50',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  present: {
    backgroundColor: '#FBC02D',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #F9A825, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  absent: {
    backgroundColor: '#90A4AE',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #546E7A, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  keyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1b',
    textAlign: 'center',
    width: '100%',
  },
  whiteText: {
    color: '#fff',
  },
})
