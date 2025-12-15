import { useState, useRef, useEffect } from 'react'
import { Platform } from 'react-native'
import { ALPHABET_LETTERS } from '../../mockData'

/**
 * Hook xử lý logic cho AlphabetTypingScreen
 */
export function useAlphabetTyping() {
  const [index, setIndex] = useState(0)
  const [userInput, setUserInput] = useState('')
  const [isCorrect, setIsCorrect] = useState(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [showInstructions, setShowInstructions] = useState(false)
  const [composingState, setComposingState] = useState({ initial: null, vowel: null, final: null })
  const inputRef = useRef(null)

  const current = ALPHABET_LETTERS[index % ALPHABET_LETTERS.length] || {}

  useEffect(() => {
    setUserInput('')
    setIsCorrect(null)
    setComposingState({ initial: null, vowel: null, final: null })
    if (inputRef.current && Platform.OS === 'web') {
      inputRef.current.focus()
    }
  }, [index])

  const handleNext = () => {
    setUserInput('')
    setIsCorrect(null)
    setIndex((prev) => (prev + 1) % ALPHABET_LETTERS.length)
  }

  const handlePrev = () => {
    setUserInput('')
    setIsCorrect(null)
    setIndex((prev) => (prev - 1 + ALPHABET_LETTERS.length) % ALPHABET_LETTERS.length)
  }

  const handleInputChange = (text) => {
    setUserInput(text)
    setIsCorrect(null)
    // Reset composing state when user manually types
    setComposingState({ initial: null, vowel: null, final: null })
  }

  // Hàm ghép ký tự Hàn Quốc
  const composeKoreanChar = (initial, vowel, final) => {
    if (!initial || !vowel) return null
    
    // Unicode base cho ký tự Hàn Quốc
    const BASE = 0xAC00
    
    // Mapping phụ âm đầu
    const initialMap = {
      'ㄱ': 0, 'ㄲ': 1, 'ㄴ': 2, 'ㄷ': 3, 'ㄸ': 4, 'ㄹ': 5, 'ㅁ': 6,
      'ㅂ': 7, 'ㅃ': 8, 'ㅅ': 9, 'ㅆ': 10, 'ㅇ': 11, 'ㅈ': 12, 'ㅉ': 13,
      'ㅊ': 14, 'ㅋ': 15, 'ㅌ': 16, 'ㅍ': 17, 'ㅎ': 18
    }
    
    // Mapping nguyên âm
    const vowelMap = {
      'ㅏ': 0, 'ㅐ': 1, 'ㅑ': 2, 'ㅒ': 3, 'ㅓ': 4, 'ㅔ': 5, 'ㅕ': 6,
      'ㅖ': 7, 'ㅗ': 8, 'ㅘ': 9, 'ㅙ': 10, 'ㅚ': 11, 'ㅛ': 12, 'ㅜ': 13,
      'ㅝ': 14, 'ㅞ': 15, 'ㅟ': 16, 'ㅠ': 17, 'ㅡ': 18, 'ㅢ': 19, 'ㅣ': 20
    }
    
    // Mapping phụ âm cuối
    const finalMap = {
      '': 0, 'ㄱ': 1, 'ㄲ': 2, 'ㄳ': 3, 'ㄴ': 4, 'ㄵ': 5, 'ㄶ': 6,
      'ㄷ': 7, 'ㄹ': 8, 'ㄺ': 9, 'ㄻ': 10, 'ㄼ': 11, 'ㄽ': 12, 'ㄾ': 13,
      'ㄿ': 14, 'ㅀ': 15, 'ㅁ': 16, 'ㅂ': 17, 'ㅄ': 18, 'ㅅ': 19, 'ㅆ': 20,
      'ㅇ': 21, 'ㅈ': 22, 'ㅊ': 23, 'ㅋ': 24, 'ㅌ': 25, 'ㅍ': 26, 'ㅎ': 27
    }
    
    const initialIdx = initialMap[initial]
    const vowelIdx = vowelMap[vowel]
    const finalIdx = finalMap[final || '']
    
    if (initialIdx === undefined || vowelIdx === undefined || finalIdx === undefined) {
      return null
    }
    
    const charCode = BASE + (initialIdx * 588) + (vowelIdx * 28) + finalIdx
    return String.fromCharCode(charCode)
  }

  // Hàm phân tích ký tự Hàn Quốc thành các thành phần
  const decomposeKoreanChar = (char) => {
    if (!char || !char.match(/[\uAC00-\uD7A3]/)) return null
    
    const BASE = 0xAC00
    const charCode = char.charCodeAt(0)
    const relativeCode = charCode - BASE
    
    const initialIdx = Math.floor(relativeCode / 588)
    const vowelIdx = Math.floor((relativeCode % 588) / 28)
    const finalIdx = relativeCode % 28
    
    const initialMap = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    const vowelMap = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
    const finalMap = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
    
    return {
      initial: initialMap[initialIdx],
      vowel: vowelMap[vowelIdx],
      final: finalMap[finalIdx] || null
    }
  }

  // Kiểm tra ký tự là phụ âm đầu, nguyên âm hay phụ âm cuối
  const isInitialConsonant = (char) => {
    return ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'].includes(char)
  }
  
  const isVowel = (char) => {
    return ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'].includes(char)
  }
  
  const isFinalConsonant = (char) => {
    return ['ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'].includes(char)
  }

  const handleCheck = () => {
    if (!userInput.trim()) return

    setAttempts((prev) => prev + 1)
    const correct = userInput.trim().toLowerCase() === current.word.toLowerCase()
    setIsCorrect(correct)

    if (correct) {
      setScore((prev) => prev + 1)
      // Tự động chuyển sang chữ tiếp theo sau 1 giây
      setTimeout(() => {
        handleNext()
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
      handleCheck()
    }
  }

  const handleVirtualKeyPress = (key) => {
    if (key === 'BACKSPACE') {
      setUserInput((prev) => {
        const newValue = prev.slice(0, -1)
        // Reset composing state khi xóa
        if (newValue.length === 0 || !newValue[newValue.length - 1].match(/[\uAC00-\uD7A3]/)) {
          setComposingState({ initial: null, vowel: null, final: null })
        }
        return newValue
      })
    } else if (key === 'SPACE') {
      // Kết thúc ký tự đang ghép và thêm space
      if (composingState.initial && composingState.vowel) {
        const composed = composeKoreanChar(composingState.initial, composingState.vowel, composingState.final)
        if (composed) {
          setUserInput((prev) => {
            // Xóa ký tự đang ghép nếu có
            let baseInput = prev
            const lastChar = baseInput[baseInput.length - 1]
            if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
              baseInput = baseInput.slice(0, -1)
            }
            return baseInput + composed + ' '
          })
        } else {
          setUserInput((prev) => prev + ' ')
        }
        setComposingState({ initial: null, vowel: null, final: null })
      } else {
        setUserInput((prev) => prev + ' ')
      }
      setIsCorrect(null)
    } else if (key === 'ENTER') {
      // Kết thúc ký tự đang ghép trước khi check
      if (composingState.initial && composingState.vowel) {
        const composed = composeKoreanChar(composingState.initial, composingState.vowel, composingState.final)
        if (composed) {
          setUserInput((prev) => {
            // Xóa ký tự đang ghép nếu có
            let baseInput = prev
            const lastChar = baseInput[baseInput.length - 1]
            if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
              baseInput = baseInput.slice(0, -1)
            }
            return baseInput + composed
          })
          setComposingState({ initial: null, vowel: null, final: null })
        }
      }
      handleCheck()
    } else {
      // Xử lý ghép ký tự Hàn Quốc
      setIsCorrect(null)
      
      if (isInitialConsonant(key)) {
        // Nếu đã có ký tự đang ghép, kết thúc nó trước
        if (composingState.initial && composingState.vowel) {
          const composed = composeKoreanChar(composingState.initial, composingState.vowel, composingState.final)
          if (composed) {
            setUserInput((prev) => {
              // Xóa ký tự đang ghép nếu có
              let baseInput = prev
              const lastChar = baseInput[baseInput.length - 1]
              if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
                baseInput = baseInput.slice(0, -1)
              }
              return baseInput + composed
            })
          }
        }
        // Bắt đầu ghép ký tự mới với phụ âm đầu
        const newState = { initial: key, vowel: null, final: null }
        setComposingState(newState)
      } else if (isVowel(key)) {
        if (composingState.initial) {
          // Đã có phụ âm đầu, thêm nguyên âm và ghép thành ký tự
          const newState = { ...composingState, vowel: key, final: null }
          const composed = composeKoreanChar(newState.initial, newState.vowel, null)
          if (composed) {
            setUserInput((prev) => {
              // Xóa ký tự cuối cùng nếu nó là ký tự đang được ghép
              let baseInput = prev
              if (composingState.initial && composingState.vowel) {
                const lastChar = baseInput[baseInput.length - 1]
                if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
                  const decomposed = decomposeKoreanChar(lastChar)
                  if (decomposed && 
                      decomposed.initial === composingState.initial && 
                      decomposed.vowel === composingState.vowel) {
                    baseInput = baseInput.slice(0, -1)
                  }
                }
              }
              return baseInput + composed
            })
            // Giữ state để có thể thêm phụ âm cuối sau
            setComposingState(newState)
          } else {
            setUserInput((prev) => prev + key)
          }
        } else {
          // Chưa có phụ âm đầu, không thể ghép, thêm trực tiếp
          setUserInput((prev) => prev + key)
        }
      } else if (isFinalConsonant(key)) {
        // Xử lý phụ âm cuối - kiểm tra cả state và ký tự cuối cùng
        const lastChar = userInput[userInput.length - 1]
        let shouldUpdate = false
        let newInput = userInput
        let newComposingState = composingState
        
        // Ưu tiên: Nếu có state đang ghép và ký tự cuối cùng khớp với state
        if (composingState.initial && composingState.vowel) {
          if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
            const decomposed = decomposeKoreanChar(lastChar)
            if (decomposed && 
                decomposed.initial === composingState.initial && 
                decomposed.vowel === composingState.vowel &&
                !decomposed.final) {
              // Ký tự cuối cùng khớp với state, thêm phụ âm cuối
              const composed = composeKoreanChar(composingState.initial, composingState.vowel, key)
              if (composed) {
                newInput = userInput.slice(0, -1) + composed
                newComposingState = { initial: null, vowel: null, final: null }
                shouldUpdate = true
              }
            }
          }
          
          // Nếu chưa update và không khớp ký tự cuối, thử ghép với state hiện tại
          if (!shouldUpdate) {
            const composed = composeKoreanChar(composingState.initial, composingState.vowel, key)
            if (composed) {
              let baseInput = userInput
              if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
                baseInput = userInput.slice(0, -1)
              }
              newInput = baseInput + composed
              newComposingState = { initial: null, vowel: null, final: null }
              shouldUpdate = true
            }
          }
        }
        
        // Không có state hoặc chưa update, kiểm tra ký tự cuối cùng trong input
        if (!shouldUpdate && lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
          const decomposed = decomposeKoreanChar(lastChar)
          if (decomposed && !decomposed.final) {
            // Ký tự không có phụ âm cuối, thêm phụ âm cuối vào
            const composed = composeKoreanChar(decomposed.initial, decomposed.vowel, key)
            if (composed) {
              newInput = userInput.slice(0, -1) + composed
              newComposingState = { 
                initial: decomposed.initial, 
                vowel: decomposed.vowel, 
                final: key 
              }
              shouldUpdate = true
            }
          }
        }
        
        // Cập nhật input và state
        if (shouldUpdate) {
          setUserInput(newInput)
          setComposingState(newComposingState)
        } else {
          // Không thể ghép, thêm trực tiếp
          setUserInput((prev) => prev + key)
        }
      } else {
        // Ký tự khác (số, ký tự đặc biệt), kết thúc ký tự đang ghép trước
        if (composingState.initial && composingState.vowel) {
          const composed = composeKoreanChar(composingState.initial, composingState.vowel, composingState.final)
          if (composed) {
            setUserInput((prev) => {
              // Xóa ký tự đang ghép nếu có
              let baseInput = prev
              const lastChar = baseInput[baseInput.length - 1]
              if (lastChar && lastChar.match(/[\uAC00-\uD7A3]/)) {
                baseInput = baseInput.slice(0, -1)
              }
              return baseInput + composed
            })
          }
          setComposingState({ initial: null, vowel: null, final: null })
        }
        setUserInput((prev) => prev + key)
      }
    }
  }

  return {
    // State
    index,
    userInput,
    isCorrect,
    score,
    attempts,
    showInstructions,
    current,
    inputRef,
    
    // Handlers
    handleNext,
    handlePrev,
    handleInputChange,
    handleCheck,
    handleKeyPress,
    handleVirtualKeyPress,
    setShowInstructions,
  }
}

