import React from 'react'
import { View, Text, StyleSheet, Platform } from 'react-native'
import { motion } from 'framer-motion'

// Layout bàn phím Hangul chuẩn với các jamo
const HANGUL_ROWS = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', 'ㅆ', 'ㄲ', 'ㄸ', 'ㅉ', 'ㅃ'],
]

export function WordleKeyboard({ keyStatuses, onPress }) {
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
            y: 5,
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
          onClick={() => onPress(key)}
          onMouseDown={(e) => {
            // Ngăn chặn text selection khi click đúp
            if (e.detail > 1) {
              e.preventDefault()
            }
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
        onTouchStart={() => onPress(key)}
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

  // Chia thành 2 hàng ngang
  const row1 = [
    ...HANGUL_ROWS[0],
    ...HANGUL_ROWS[1],
  ]
  const row2 = [
    ...HANGUL_ROWS[2],
    'Xóa',
    'Gửi',
  ]

  return (
    <View style={styles.keyboard}>
      <View style={styles.row}>
        {row1.map(renderKey)}
      </View>
      <View style={styles.row}>
        {row2.map(renderKey)}
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
    height: 48,
    backgroundColor: '#F5F5DC', // Beige/cream color
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    ...(Platform.OS === 'web' && { 
      cursor: 'pointer',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.1s ease',
    }),
  },
  submitKey: {
    minWidth: 60,
    backgroundColor: '#6aaa64',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(106, 170, 100, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1)',
    }),
  },
  deleteKey: {
    minWidth: 60,
    backgroundColor: '#787c7e',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 2px 4px rgba(120, 124, 126, 0.3), 0 1px 2px rgba(0, 0, 0, 0.1)',
    }),
  },
  correct: {
    backgroundColor: '#6aaa64',
  },
  present: {
    backgroundColor: '#c9b458',
  },
  absent: {
    backgroundColor: '#787c7e',
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
