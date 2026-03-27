import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TextInput, Platform, Pressable, Image } from 'react-native'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import { normalizeImageSource } from '@tokki/app/features/study/api'

/**
 * TypeAnswerCard: Component hiển thị câu hỏi với chế độ gõ đáp án
 */
export function TypeAnswerCard({
  question,
  correctAnswer,
  imageUrl,
  onAnswerSubmit,
  showResult = false,
  disabled = false,
  typedAnswer = '',
  starIcon,
  isFavorite = false,
  onToggleFavorite,
}) {
  const [inputValue, setInputValue] = useState(typedAnswer || '')

  useEffect(() => {
    setInputValue(typedAnswer || '')
  }, [typedAnswer])

  const handleSubmit = () => {
    if (disabled || showResult || !inputValue.trim()) return
    onAnswerSubmit?.(inputValue.trim())
  }

  // Xử lý phím Enter để submit
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && !disabled && !showResult && inputValue.trim()) {
        event.preventDefault()
        handleSubmit()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [inputValue, disabled, showResult, handleSubmit])

  const isCorrect = showResult && inputValue.trim().toLowerCase() === correctAnswer.trim().toLowerCase()

  // Render star icon nếu có
  const renderStarIcon = () => {
    const iconToUse = starIcon || StarIcon
    
    if (!iconToUse || !onToggleFavorite) return null
    
    return (
      <Pressable 
        style={styles.starButton} 
        onPress={() => {
          onToggleFavorite()
        }}
      >
        <Image
          source={normalizeImageSource(iconToUse)}
          style={[
            styles.starIcon,
            {
              tintColor: isFavorite ? '#F1BE4B' : '#FFFFFF',
              opacity: isFavorite ? 1 : 0.5,
            }
          ]}
          resizeMode="contain"
        />
      </Pressable>
    )
  }

  return (
    <View style={styles.container}>
      {/* Question Card - Màu xanh lá với star icon */}
      <View style={styles.questionCard}>
        {renderStarIcon()}
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText} numberOfLines={0}>
            {question}
          </Text>
        </View>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            showResult && isCorrect && styles.inputCorrect,
            showResult && !isCorrect && inputValue.trim() && styles.inputWrong,
          ]}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          placeholder="Nhập đáp án..."
          placeholderTextColor="#999999"
          editable={!disabled && !showResult}
          autoFocus={false}
        />
        {showResult && (
          <View style={styles.resultContainer}>
            {isCorrect ? (
              <Text style={styles.correctText}>✓ Đúng!</Text>
            ) : (
              <View style={styles.wrongContainer}>
                <Text style={styles.wrongText}>✗ Sai</Text>
                <Text style={styles.correctAnswerText}>Đáp án đúng: {correctAnswer}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 16,
  },
  questionCard: {
    width: '100%',
    backgroundColor: '#79964E',
    borderRadius: 16,
    paddingVertical: '20%',
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  starButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  starIcon: {
    width: 28,
    height: 28,
  },
  questionTextContainer: {
    width: '100%',
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
    flexWrap: 'wrap',
    width: '100%',
  },
  inputContainer: {
    width: '100%',
    gap: 12,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    fontSize: 18,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      outlineWidth: 0,
      outlineStyle: 'none',
      outlineColor: 'transparent',
    }),
  },
  inputCorrect: {
    borderColor: '#79964E',
    backgroundColor: '#79964E20',
  },
  inputWrong: {
    borderColor: '#F44336',
    backgroundColor: '#F4433620',
  },
  resultContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
  },
  correctText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#79964E',
    fontFamily: 'Epilogue, sans-serif',
  },
  wrongContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  wrongText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F44336',
    fontFamily: 'Epilogue, sans-serif',
  },
  correctAnswerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
})

