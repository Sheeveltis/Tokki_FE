import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'

/**
 * VirtualKoreanKeyboard: Bàn phím ảo tiếng Hàn với layout chuẩn
 * @param {{
 *   onKeyPress: (key: string) => void
 * }} props
 */
export function VirtualKoreanKeyboard({ onKeyPress }) {
  const [pressedKey, setPressedKey] = useState(null)
  const [isShiftPressed, setIsShiftPressed] = useState(false)

  // Mapping từ phím thật sang phím ảo (không shift)
  const keyMapping = {
    // Numbers
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
    '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
    // Top row (Q-P)
    'q': 'ㅂ', 'w': 'ㅈ', 'e': 'ㄷ', 'r': 'ㄱ', 't': 'ㅅ',
    'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 'o': 'ㅐ', 'p': 'ㅔ',
    // Middle row (A-L)
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
    'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    // Bottom row (Z-M)
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ',
    'n': 'ㅜ', 'm': 'ㅡ',
    // Special keys
    'Backspace': 'BACKSPACE',
    ' ': 'SPACE',
    'Enter': 'ENTER',
  }

  // Mapping từ phím thật sang phím ảo (có shift)
  const shiftKeyMapping = {
    // Numbers với shift = ký tự đặc biệt
    '1': '!', '2': '@', '3': '#', '4': '$', '5': '%',
    '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    // Top row (Q-P) với shift = double consonants
    'q': 'ㅃ', // ㅂ → ㅃ
    'w': 'ㅉ', // ㅈ → ㅉ
    'e': 'ㄸ', // ㄷ → ㄸ
    'r': 'ㄲ', // ㄱ → ㄲ
    't': 'ㅆ', // ㅅ → ㅆ
    'y': 'ㅛ', 'u': 'ㅕ', 'i': 'ㅑ', 
    'o': 'ㅒ', // ㅐ → ㅒ
    'p': 'ㅖ', // ㅔ → ㅖ
    // Middle row (A-L) với shift
    'a': 'ㅁ', 's': 'ㄴ', 'd': 'ㅇ', 'f': 'ㄹ', 'g': 'ㅎ',
    'h': 'ㅗ', 'j': 'ㅓ', 'k': 'ㅏ', 'l': 'ㅣ',
    // Bottom row (Z-M) với shift
    'z': 'ㅋ', 'x': 'ㅌ', 'c': 'ㅊ', 'v': 'ㅍ', 'b': 'ㅠ',
    'n': 'ㅜ', 'm': 'ㅡ',
  }

  const handleKeyPress = (key) => {
    onKeyPress?.(key)
  }

  // Listen keyboard events
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyDown = (e) => {
      // Detect Shift key
      if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight') {
        setIsShiftPressed(true)
        return
      }

      // Chỉ xử lý khi không phải đang type trong input field
      const isInputFocused = document.activeElement?.tagName === 'INPUT' || 
                             document.activeElement?.tagName === 'TEXTAREA'
      
      // Sử dụng mapping phù hợp (có shift hay không)
      const mapping = e.shiftKey ? shiftKeyMapping : keyMapping
      const key = e.key.toLowerCase()
      const mappedKey = mapping[key] || mapping[e.key]
      
      if (mappedKey) {
        if (isInputFocused) {
          // Nếu đang focus input, chỉ highlight phím tương ứng
          setPressedKey(mappedKey)
          // Không prevent default để input vẫn nhận được ký tự
        } else {
          // Nếu không focus input, trigger key press
          e.preventDefault()
          setPressedKey(mappedKey)
          handleKeyPress(mappedKey)
        }
      }
    }

    const handleKeyUp = (e) => {
      // Detect Shift key release
      if (e.key === 'Shift' || e.key === 'ShiftLeft' || e.key === 'ShiftRight') {
        setIsShiftPressed(false)
        return
      }

      const mapping = e.shiftKey ? shiftKeyMapping : keyMapping
      const key = e.key.toLowerCase()
      const mappedKey = mapping[key] || mapping[e.key]
      
      if (mappedKey) {
        setPressedKey(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown, true) // Use capture phase
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [onKeyPress])

  return (
    <View style={styles.keyboardContainer}>
          {/* Top Row - Number Row with Hangul labels */}
          <View style={styles.keyboardRow}>
            {[
              { main: '1', sub: '!' },
              { main: '2', sub: '@' },
              { main: '3', sub: '#' },
              { main: '4', sub: '$' },
              { main: '5', sub: '%' },
              { main: '6', sub: '^' },
              { main: '7', sub: '&' },
              { main: '8', sub: '*' },
              { main: '9', sub: '(' },
              { main: '0', sub: ')' },
            ].map((key) => {
              const displayKey = isShiftPressed ? key.sub : key.main
              const isPressed = pressedKey === key.main || pressedKey === key.sub
              
              return (
                <Pressable
                  key={key.main}
                  style={[
                    styles.keyButton,
                    isPressed && styles.keyButtonPressed,
                  ]}
                  onPress={() => handleKeyPress(isShiftPressed ? key.sub : key.main)}
                >
                  <Text style={styles.keyTextMain}>{displayKey}</Text>
                  <Text style={styles.keyTextSub}>{isShiftPressed ? key.main : key.sub}</Text>
                </Pressable>
              )
            })}
            <Pressable
              style={[
                styles.keyButton,
                styles.controlKey,
                styles.backspaceKey,
                pressedKey === 'BACKSPACE' && styles.keyButtonPressed,
              ]}
              onPress={() => handleKeyPress('BACKSPACE')}
            >
              <Text style={styles.controlKeyText}>⌫</Text>
            </Pressable>
          </View>

          {/* Second Row - Top Hangul Row (ㅂ ㅈ ㄷ ㄱ ㅅ ㅛ ㅕ ㅑ ㅐ ㅔ) */}
          <View style={styles.keyboardRow}>
            {[
              { hangul: 'ㅂ', shift: 'ㅃ', latin: 'Q' },
              { hangul: 'ㅈ', shift: 'ㅉ', latin: 'W' },
              { hangul: 'ㄷ', shift: 'ㄸ', latin: 'E' },
              { hangul: 'ㄱ', shift: 'ㄲ', latin: 'R' },
              { hangul: 'ㅅ', shift: 'ㅆ', latin: 'T' },
              { hangul: 'ㅛ', shift: 'ㅛ', latin: 'Y' },
              { hangul: 'ㅕ', shift: 'ㅕ', latin: 'U' },
              { hangul: 'ㅑ', shift: 'ㅑ', latin: 'I' },
              { hangul: 'ㅐ', shift: 'ㅒ', latin: 'O' },
              { hangul: 'ㅔ', shift: 'ㅖ', latin: 'P' },
            ].map((key) => {
              const displayHangul = isShiftPressed ? key.shift : key.hangul
              const isPressed = pressedKey === key.hangul || pressedKey === key.shift
              
              return (
                <Pressable
                  key={key.hangul}
                  style={[
                    styles.keyButton,
                    isPressed && styles.keyButtonPressed,
                  ]}
                  onPress={() => handleKeyPress(isShiftPressed ? key.shift : key.hangul)}
                >
                  <Text style={styles.keyTextMain}>{displayHangul}</Text>
                  <Text style={styles.keyTextSub}>{key.latin}</Text>
                </Pressable>
              )
            })}
          </View>

          {/* Third Row - Middle Hangul Row (ㅁ ㄴ ㅇ ㄹ ㅎ ㅗ ㅓ ㅏ ㅣ) */}
          <View style={styles.keyboardRow}>
            <View style={styles.keyboardRowSpacer} />
            {[
              { hangul: 'ㅁ', latin: 'A' },
              { hangul: 'ㄴ', latin: 'S' },
              { hangul: 'ㅇ', latin: 'D' },
              { hangul: 'ㄹ', latin: 'F' },
              { hangul: 'ㅎ', latin: 'G' },
              { hangul: 'ㅗ', latin: 'H' },
              { hangul: 'ㅓ', latin: 'J' },
              { hangul: 'ㅏ', latin: 'K' },
              { hangul: 'ㅣ', latin: 'L' },
            ].map((key) => (
              <Pressable
                key={key.hangul}
                style={[
                  styles.keyButton,
                  pressedKey === key.hangul && styles.keyButtonPressed,
                ]}
                onPress={() => handleKeyPress(key.hangul)}
              >
                <Text style={styles.keyTextMain}>{key.hangul}</Text>
                <Text style={styles.keyTextSub}>{key.latin}</Text>
              </Pressable>
            ))}
            <View style={styles.keyboardRowSpacer} />
          </View>

          {/* Fourth Row - Bottom Hangul Row (ㅋ ㅌ ㅊ ㅍ ㅠ ㅜ ㅡ) */}
          <View style={styles.keyboardRow}>
            <Pressable
              style={[
                styles.keyButton,
                styles.controlKey,
                styles.shiftKey,
                isShiftPressed && styles.keyButtonPressed,
              ]}
              onPress={() => {
                setIsShiftPressed(!isShiftPressed)
              }}
            >
              <Text style={styles.controlKeyText}>⇧</Text>
            </Pressable>
            {[
              { hangul: 'ㅋ', latin: 'Z' },
              { hangul: 'ㅌ', latin: 'X' },
              { hangul: 'ㅊ', latin: 'C' },
              { hangul: 'ㅍ', latin: 'V' },
              { hangul: 'ㅠ', latin: 'B' },
              { hangul: 'ㅜ', latin: 'N' },
              { hangul: 'ㅡ', latin: 'M' },
            ].map((key) => (
              <Pressable
                key={key.hangul}
                style={[
                  styles.keyButton,
                  pressedKey === key.hangul && styles.keyButtonPressed,
                ]}
                onPress={() => handleKeyPress(key.hangul)}
              >
                <Text style={styles.keyTextMain}>{key.hangul}</Text>
                <Text style={styles.keyTextSub}>{key.latin}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[
                styles.keyButton,
                styles.controlKey,
                styles.shiftKey,
                isShiftPressed && styles.keyButtonPressed,
              ]}
              onPress={() => {
                setIsShiftPressed(!isShiftPressed)
              }}
            >
              <Text style={styles.controlKeyText}>⇧</Text>
            </Pressable>
          </View>

          {/* Bottom Row - Control Keys */}
          <View style={styles.keyboardRow}>
            <Pressable
              style={[styles.keyButton, styles.controlKey, styles.ctrlKey]}
              onPress={() => {}}
            >
              <Text style={styles.controlKeyText}>Ctrl</Text>
            </Pressable>
            <Pressable
              style={[styles.keyButton, styles.controlKey, styles.altKey]}
              onPress={() => {}}
            >
              <Text style={styles.controlKeyText}>Alt</Text>
            </Pressable>
            <Pressable
              style={[
                styles.keyButton,
                styles.controlKey,
                styles.spaceKey,
                pressedKey === 'SPACE' && styles.keyButtonPressed,
              ]}
              onPress={() => handleKeyPress('SPACE')}
            >
              <Text style={styles.controlKeyText}>Space</Text>
            </Pressable>
            <Pressable
              style={[styles.keyButton, styles.controlKey, styles.altKey]}
              onPress={() => {}}
            >
              <Text style={styles.controlKeyText}>Alt</Text>
            </Pressable>
            <Pressable
              style={[
                styles.keyButton,
                styles.controlKey,
                styles.enterKey,
                pressedKey === 'ENTER' && styles.keyButtonPressed,
              ]}
              onPress={() => handleKeyPress('ENTER')}
            >
              <Text style={styles.controlKeyText}>Enter</Text>
            </Pressable>
          </View>
    </View>
  )
}

const styles = StyleSheet.create({
  keyboardContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    gap: 8,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }
    })
  },
  keyboardRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'nowrap',
  },
  keyboardRowSpacer: {
    width: 90,
  },
  keyButton: {
    minWidth: 52,
    width: 52,
    height: 52,
    paddingHorizontal: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowOffset: { width: 0, height: 1 },
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        userSelect: 'none',
      },
    }),
  },
  keyButtonPressed: {
    backgroundColor: '#F1BE4B',
    borderColor: '#E5A93D',
    transform: [{ scale: 0.95 }],
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      },
      default: {
        shadowOpacity: 0.2,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }
    })
  },
  keyTextMain: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 26,
  },
  keyTextSub: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 12,
    position: 'absolute',
    top: 3,
    right: 4,
  },
  controlKey: {
    backgroundColor: '#E8E8E8',
    borderColor: '#C0C0C0',
    minWidth: 70,
  },
  backspaceKey: {
    minWidth: 100,
  },
  shiftKey: {
    minWidth: 100,
    backgroundColor: '#D8D8D8',
  },
  ctrlKey: {
    minWidth: 70,
    backgroundColor: '#D8D8D8',
  },
  altKey: {
    minWidth: 70,
    backgroundColor: '#D8D8D8',
  },
  spaceKey: {
    flex: 1,
    minWidth: 220,
    maxWidth: 450,
    backgroundColor: '#FFFFFF',
  },
  enterKey: {
    minWidth: 100,
    backgroundColor: '#79964E',
    borderColor: '#6B8540',
  },
  controlKeyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

