import { useMemo } from 'react'
import { View, Text, StyleSheet, Platform, ImageBackground } from 'react-native'
import { motion } from 'framer-motion'
import BackgroundClock from '../../../../../../../assets/backgroundClock.png'

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
    <ImageBackground source={BackgroundClock} style={styles.keyboard} resizeMode="stretch">
      <View style={styles.row}>
        {row1.map(renderKey)}
      </View>
      <View style={styles.row}>
        {row2.map(renderKey)}
      </View>
      <View style={styles.row}>
        {row3.map(renderKey)}
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  keyboard: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      web: {
        paddingVertical: 50,
        paddingHorizontal: 60,
      },
      native: {
        paddingVertical: 45,
        paddingHorizontal: 20,
      },
      default: {
        paddingVertical: 25,
        paddingHorizontal: 15,
      }
    }),
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  key: {
    minWidth: Platform.OS === 'web' ? 40 : 29,
    height: Platform.OS === 'web' ? 40 : 29,
    backgroundColor: '#FFF9E3',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: Platform.OS === 'web' ? 0 : 3,
    borderBottomColor: '#EAD7AE',
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
    minWidth: Platform.OS === 'web' ? 70 : 50,
    backgroundColor: '#4CAF50', // Friendly Green
    borderBottomColor: '#2E7D32',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  deleteKey: {
    minWidth: Platform.OS === 'web' ? 70 : 50,
    backgroundColor: '#EF5350', // Soft earthy red
    borderBottomColor: '#C62828',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #C62828, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  correct: {
    backgroundColor: '#4CAF50',
    borderBottomColor: '#2E7D32',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #2E7D32, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  present: {
    backgroundColor: '#FBC02D',
    borderBottomColor: '#F9A825',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #F9A825, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  absent: {
    backgroundColor: '#90A4AE',
    borderBottomColor: '#546E7A',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 0 #546E7A, 0 6px 8px rgba(0, 0, 0, 0.15)',
    }),
  },
  keyText: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    fontWeight: 'bold',
    color: '#1a1a1b',
    textAlign: 'center',
    width: '100%',
  },
  whiteText: {
    color: '#fff',
  },
})
