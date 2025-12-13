import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../../api'

/**
 * QuestionCard: Component hiển thị một câu hỏi trắc nghiệm
 */
export function QuestionCard({
  question,
  options,
  correctAnswerId,
  imageUrl,
  onAnswerSelect,
  showResult = false,
  disabled = false,
  selectedAnswerId,
}) {
  const handleAnswerPress = (answerId) => {
    if (disabled || showResult) return
    const isCorrect = answerId === correctAnswerId
    onAnswerSelect?.(answerId, isCorrect)
  }

  const getAnswerStyle = (answerId) => {
    if (!showResult) {
      return selectedAnswerId === answerId ? styles.answerSelected : styles.answer
    }

    // Sau khi nộp bài, hiển thị kết quả
    if (answerId === correctAnswerId) {
      return styles.answerCorrect
    }
    if (selectedAnswerId === answerId && answerId !== correctAnswerId) {
      return styles.answerWrong
    }
    return styles.answer
  }

  return (
    <View style={styles.container}>
      {/* Question Image */}
      {imageUrl && (
        <View style={styles.imageContainer}>
          <Image source={normalizeImageSource(imageUrl)} style={styles.image} resizeMode="contain" />
        </View>
      )}

      {/* Question Text */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{question}</Text>
      </View>

      {/* Answer Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              getAnswerStyle(option.id),
              pressed && !disabled && !showResult && styles.answerPressed,
            ]}
            onPress={() => handleAnswerPress(option.id)}
            disabled={disabled || showResult}
          >
            <Text style={styles.answerText}>{option.text}</Text>
            {showResult && option.id === correctAnswerId && (
              <Text style={styles.correctMark}>✓</Text>
            )}
            {showResult && selectedAnswerId === option.id && option.id !== correctAnswerId && (
              <Text style={styles.wrongMark}>✗</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    gap: 16,
    borderWidth: 2,
    borderColor: '#F4B8AF',
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  imageContainer: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  questionContainer: {
    width: '100%',
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  answer: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'borderColor, backgroundColor',
      transitionDuration: '200ms',
    }),
  },
  answerSelected: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F1BE4B20',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F1BE4B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerCorrect: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#4CAF5020',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerWrong: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F4433620',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  answerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    flex: 1,
    fontFamily: 'Epilogue, sans-serif',
  },
  correctMark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#4CAF50',
    marginLeft: 12,
  },
  wrongMark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F44336',
    marginLeft: 12,
  },
})

