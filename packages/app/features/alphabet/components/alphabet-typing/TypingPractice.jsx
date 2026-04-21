import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView } from 'react-native'
import { RedoOutlined } from '@ant-design/icons'

const ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm']
]

const KEY_LABELS = {
  'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ', 'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
  'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ', 'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
  'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ', 'n': 'ㅜ', 'm': 'ㅡ',
  'Q': 'ㅃ', 'W': 'ㅉ', 'E': 'ㄸ', 'R': 'ㄲ', 'T': 'ㅆ', 'O': 'ㅒ', 'P': 'ㅖ',
  ' ': ' '
}

const KOREAN_KEYBOARD_MAP = {
  'ㅏ': ['k'], 'ㅑ': ['i'], 'ㅓ': ['j'], 'ㅕ': ['u'], 'ㅗ': ['h'], 'ㅛ': ['y'], 'ㅜ': ['n'], 'ㅠ': ['b'], 'ㅡ': ['m'], 'ㅣ': ['l'],
  'ㅐ': ['o'], 'ㅒ': ['O'], 'ㅔ': ['p'], 'ㅖ': ['P'],
  'ㅘ': ['h', 'k'], 'ㅙ': ['h', 'o'], 'ㅚ': ['h', 'l'], 'ㅝ': ['n', 'j'], 'ㅞ': ['n', 'p'], 'ㅟ': ['n', 'l'], 'ㅢ': ['m', 'l'],
  'ㄱ': ['r'], 'ㄴ': ['s'], 'ㄷ': ['e'], 'ㄹ': ['f'], 'ㅁ': ['a'], 'ㅂ': ['q'], 'ㅅ': ['t'], 'ㅇ': ['d'], 'ㅈ': ['w'], 'ㅊ': ['c'], 'ㅋ': ['z'], 'ㅌ': ['x'], 'ㅍ': ['v'], 'ㅎ': ['g'],
  'ㄲ': ['R'], 'ㄸ': ['E'], 'ㅃ': ['Q'], 'ㅆ': ['T'], 'ㅉ': ['W'],
  ' ': [' ']
}

// Finger colors for positioning
const FINGER_COLORS = {
  'left-pinky': '#FFADAD',
  'left-ring': '#FFD6A5',
  'left-middle': '#FDFFB6',
  'left-index': '#CAFFBF',
  'right-index': '#9BF6FF',
  'right-middle': '#A0C4FF',
  'right-ring': '#BDB2FF',
  'right-pinky': '#FFC6FF',
}

const KEY_FINGERS = {
  'q': 'left-pinky', 'a': 'left-pinky', 'z': 'left-pinky',
  'w': 'left-ring', 's': 'left-ring', 'x': 'left-ring',
  'e': 'left-middle', 'd': 'left-middle', 'c': 'left-middle',
  'r': 'left-index', 'f': 'left-index', 'v': 'left-index',
  't': 'left-index', 'g': 'left-index', 'b': 'left-index',
  'y': 'right-index', 'h': 'right-index', 'n': 'right-index',
  'u': 'right-index', 'j': 'right-index', 'm': 'right-index',
  'i': 'right-middle', 'k': 'right-middle',
  'o': 'right-ring', 'l': 'right-ring',
  'p': 'right-pinky',
  ' ': 'right-index', // Simplification
  'Q': 'left-pinky', 'W': 'left-ring', 'E': 'left-middle', 'R': 'left-index', 'T': 'left-index', 'O': 'right-ring', 'P': 'right-pinky',
  'Shift': 'left-pinky' // Simplification, usually both pinkies
}

const isShiftRequired = (key) => key && key === key.toUpperCase() && key !== key.toLowerCase();

const HANGUL_COMPOSITION = {
  'hk': 'ㅘ', 'ho': 'ㅙ', 'hl': 'ㅚ',
  'nj': 'ㅝ', 'np': 'ㅞ', 'nl': 'ㅟ',
  'ml': 'ㅢ'
}

export function TypingPractice({ targetWord, onComplete }) {
  const isSentenceMode = targetWord && targetWord.length > 1
  const [pressedKeys, setPressedKeys] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [sentenceInput, setSentenceInput] = useState('')

  const targetKeys = targetWord?.split('').reduce((acc, char) => {
    const keys = KOREAN_KEYBOARD_MAP[char] || []
    return [...acc, ...keys]
  }, []) || []

  const currentTargetKeyIndex = pressedKeys.length
  const currentTargetKey = !isSentenceMode ? targetKeys[currentTargetKeyIndex] : null
  const shiftRequired = !isSentenceMode && isShiftRequired(currentTargetKey)

  // Add physical keyboard support for Web (Guided mode - only for single letters)
  useEffect(() => {
    if (!isSentenceMode && typeof window !== 'undefined') {
      const handleKeyDown = (e) => {
        let key = e.key
        if (key.length === 1) {
          if (e.shiftKey && KEY_LABELS[key.toUpperCase()]) {
            handleKeyPress(key.toUpperCase())
          } else {
            handleKeyPress(key.toLowerCase())
          }
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [currentTargetKey, pressedKeys, isSentenceMode])

  useEffect(() => {
    // Reset when targetWord changes
    setPressedKeys([])
    setCurrentInput('')
    setSentenceInput('')
  }, [targetWord])

  const handleKeyPress = (key) => {
    if (!currentTargetKey) return

    if (key === currentTargetKey) {
      const nextPressed = [...pressedKeys, key]
      setPressedKeys(nextPressed)

      let inputStr = nextPressed.map(k => KEY_LABELS[k] || k).join('')
      const compositeKey = nextPressed.join('')
      if (HANGUL_COMPOSITION[compositeKey]) {
        inputStr = HANGUL_COMPOSITION[compositeKey]
      }
      setCurrentInput(inputStr)

      if (nextPressed.length === targetKeys.length) {
        setTimeout(() => {
          onComplete && onComplete()
        }, 500)
      }
    }
  }

  const handleSentenceInputChange = (text) => {
    setSentenceInput(text)
    if (text.length > 0 && text.trim() === targetWord.trim()) {
      setTimeout(() => {
        onComplete && onComplete()
      }, 500)
    }
  }

  const handleReset = () => {
    setPressedKeys([])
    setCurrentInput('')
    setSentenceInput('')
  }

  const isFinished = isSentenceMode
    ? (sentenceInput.length > 0 && sentenceInput.trim() === targetWord.trim())
    : (pressedKeys.length > 0 && pressedKeys.length === targetKeys.length)

  useEffect(() => {
    if (isFinished) {
      const timer = setTimeout(() => {
        handleReset()
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [isFinished])

  const renderKey = (keyChar) => {
    const isShifted = shiftRequired;
    const displayChar = isShifted && KEY_LABELS[keyChar.toUpperCase()] ? keyChar.toUpperCase() : keyChar;
    const label = KEY_LABELS[displayChar] || displayChar.toUpperCase()

    // In sentence mode, we don't guide (highlight) the next key
    const isTarget = !isSentenceMode && displayChar === currentTargetKey
    const fingerType = KEY_FINGERS[displayChar]
    const fingerColor = FINGER_COLORS[fingerType]

    return (
      <View
        key={keyChar}
        style={[
          styles.key,
          isTarget && styles.targetKey,
          isTarget && { borderColor: fingerColor, borderWidth: 3 }
        ]}
      >
        <Text style={[styles.keyLabel, isTarget && styles.targetKeyLabel]}>{label}</Text>
        <Text style={styles.subLabel}>{displayChar.toUpperCase()}</Text>
        {isTarget && (
          <View style={[styles.fingerIndicator, { backgroundColor: fingerColor }]} />
        )}
      </View>
    )
  }

  const renderSentenceWithFeedback = (text, input, isTarget = false) => {
    return text.split('').map((char, i) => {
      let color = isTarget ? '#1A1A1A' : '#ccc' // Default colors
      if (i < input.length) {
        color = input[i] === char ? '#4CAF50' : '#D32F2F'
      }
      return (
        <Text
          key={i}
          style={[
            isTarget ? styles.targetWordBig : styles.inputTextFree,
            { color }
          ]}
        >
          {char}
        </Text>
      )
    })
  }

  const renderTypedContent = (target, input) => {
    return input.split('').map((char, i) => {
      const color = char === target[i] ? '#4CAF50' : '#D32F2F'
      return (
        <Text key={i} style={[styles.inputTextFree, { color }]}>
          {char}
        </Text>
      )
    })
  }

  return (
    <ScrollView
      style={{ width: '100%' }}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Target word at the top */}
      <View style={styles.targetSection}>
        <View style={styles.targetDisplay}>
          <Text style={styles.labelSmall}>Mục tiêu</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap', justifyContent: 'center' }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
              {isSentenceMode ? renderSentenceWithFeedback(targetWord, sentenceInput, true) : (
                <Text style={styles.targetWordBig}>{targetWord}</Text>
              )}
            </View>
            {shiftRequired && (
              <View style={styles.shiftBadge}>
                <Text style={styles.shiftBadgeText}>+SHIFT</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* 2. Input directly under the target */}
      <View style={styles.inputSection}>
        {/* Left slot for label */}
        <View style={styles.sideSlot}>
          <Text style={styles.labelSmall}>Bạn gõ</Text>
        </View>

        {/* Center slot for input box */}
        <View style={styles.centerSlot}>
          <View style={[styles.inputOutline, isSentenceMode && styles.inputOutlineLarge, isFinished && styles.inputOutlineFinished]}>
            {isSentenceMode ? (
              <>
                <View style={styles.sentenceFeedbackContainer}>
                  {renderTypedContent(targetWord, sentenceInput)}
                </View>
                <TextInput
                  style={styles.hiddenInput}
                  value={sentenceInput}
                  onChangeText={handleSentenceInputChange}
                  autoFocus={true}
                  multiline={targetWord.length > 20}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder={sentenceInput.length === 0 ? "Bắt đầu gõ..." : ""}
                />
              </>
            ) : (
              <Text style={[styles.inputText, isFinished && styles.inputTextFinished]}>{currentInput || '_'}</Text>
            )}

            {isFinished && (
              <View style={styles.praiseContainer}>
                <Text style={styles.praiseText}>Làm tốt lắm</Text>
              </View>
            )}
          </View>
        </View>

        {/* Right slot for guide */}
        <View style={styles.sideSlot}>
          {!isSentenceMode && (
            <View style={styles.guideContainer}>
              <Text style={styles.guideText}>
                {shiftRequired ? (
                  <>Giữ <Text style={styles.highlightText}>Shift</Text> + <Text style={styles.highlightText}>{KEY_LABELS[currentTargetKey]}</Text></>
                ) : (
                  <>Bấm phím <Text style={styles.highlightText}>{KEY_LABELS[currentTargetKey] || currentTargetKey?.toUpperCase()}</Text></>
                )}
              </Text>
              <View style={styles.progressDots}>
                {targetKeys.map((_, i) => (
                  <View key={i} style={[styles.dot, i < pressedKeys.length && styles.dotActive]} />
                ))}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 3. Keyboard at the bottom as a visual reference only */}
      <View style={styles.keyboard}>
        {/* Row 1 */}
        <View style={styles.row}>
          {ROWS[0].map(renderKey)}
        </View>

        {/* Row 2 */}
        <View style={[styles.row, { paddingLeft: '2%' }]}>
          {ROWS[1].map(renderKey)}
        </View>

        {/* Row 3 */}
        <View style={[styles.row, { paddingLeft: '4.5%' }]}>
          <View style={[
            styles.key,
            styles.shiftKey,
            shiftRequired && styles.targetKey,
            shiftRequired && { borderColor: FINGER_COLORS[KEY_FINGERS['Shift']], borderWidth: 3 }
          ]}>
            <Text style={[styles.shiftLabel, shiftRequired && styles.targetKeyLabel]}>Shift</Text>
          </View>
          {ROWS[2].map(renderKey)}
          <View style={[
            styles.key,
            styles.shiftKey,
            shiftRequired && styles.targetKey,
            shiftRequired && { borderColor: FINGER_COLORS[KEY_FINGERS['Shift']], borderWidth: 3 }
          ]}>
            <Text style={[styles.shiftLabel, shiftRequired && styles.targetKeyLabel]}>Shift</Text>
          </View>
        </View>

        {/* Space Row */}
        <View style={[styles.row, { justifyContent: 'center', marginTop: 4 }]}>
          <View
            style={[
              styles.key,
              styles.spaceKey,
              currentTargetKey === ' ' && styles.targetKey,
              currentTargetKey === ' ' && { borderColor: FINGER_COLORS['right-index'], borderWidth: 3 }
            ]}
          >
            <Text style={styles.spaceLabel}>Space</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 0,
    gap: 16,
  },
  targetSection: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  inputSection: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    marginTop: 0,
  },
  targetDisplay: {
    alignItems: 'center',
  },
  inputDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  sideSlot: {
    flex: 1,
    minWidth: 80,
  },
  centerSlot: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelSmall: {
    fontSize: 11,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 4,
    fontWeight: '800',
  },
  targetWordBig: {
    fontSize: 44,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  inputOutline: {
    minWidth: 140,
    height: 80,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 15,
    overflow: 'hidden',
  },
  inputOutlineLarge: {
    width: '100%',
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  inputText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#D32F2F',
    fontFamily: 'Epilogue, sans-serif',
  },
  inputTextFree: {
    fontSize: 28,
    fontWeight: '700',
    color: '#D32F2F',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
    textAlign: 'center',
  },
  sentenceFeedbackContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01, // Nearly invisible but focusable
    fontSize: 28,
    textAlign: 'center',
    padding: 10,
    outlineStyle: 'none', // for web
  },
  keyboard: {
    backgroundColor: '#FAF9F6',
    padding: 24,
    borderRadius: 32,
    gap: 14,
    width: '100%',
    maxWidth: 850,
    borderWidth: 2,
    borderColor: '#EEDCC5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
  },
  key: {
    width: 62,
    height: 75,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  shiftKey: {
    width: 100,
    backgroundColor: '#F9FAFB',
  },
  shiftLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#777',
  },
  targetKey: {
    backgroundColor: '#FFFBEB',
  },
  keyLabel: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  targetKeyLabel: {
    color: '#D32F2F',
    fontSize: 36,
  },
  subLabel: {
    fontSize: 9,
    color: '#AAA',
    position: 'absolute',
    bottom: 2,
    right: 4,
    fontWeight: '600',
  },
  fingerIndicator: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  guideContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  guideText: {
    fontSize: 16,
    color: '#444',
    fontWeight: '500',
    textAlign: 'right',
  },
  progressDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#4CAF50',
    transform: [{ scale: 1.1 }],
  },
  highlightText: {
    fontWeight: '900',
    color: '#D32F2F',
    fontSize: 18,
  },
  shiftBadge: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
    marginTop: 10,
  },
  shiftBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  inputOutlineFinished: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  inputTextFinished: {
    color: '#4CAF50',
  },
  inlineResetBtn: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inlineResetText: {
    color: '#4CAF50',
    fontWeight: '700',
    fontSize: 14,
  },
  praiseContainer: {
    position: 'absolute',
    // right: 15,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  praiseText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
  },
  spaceKey: {
    width: 420,
    backgroundColor: '#fff',
  },
  spaceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#AAA',
    textTransform: 'uppercase',
    letterSpacing: 2,
  }
})
