import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../api'
import StarIcon from '../assets/icon/icon-mainflow/star.svg'

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
  starIcon,
  isFavorite = false,
  onToggleFavorite,
}) {
  const handleAnswerPress = (answerId) => {
    // Không cho chọn khi đã disabled (đã nộp bài)
    if (disabled) return
    
    // Cho phép chọn lại nếu chưa chọn hoặc đã chọn sai
    if (selectedAnswerId && selectedAnswerId === correctAnswerId) return // Đã chọn đúng rồi, không cho chọn lại
    
    const isCorrect = answerId === correctAnswerId
    onAnswerSelect?.(answerId, isCorrect)
  }

  // Xử lý phím bàn phím (1, 2, 3, 4)
  useEffect(() => {
    if (Platform.OS !== 'web') return

    const handleKeyPress = (event) => {
      // Chỉ xử lý khi chưa chọn đúng
      if (selectedAnswerId === correctAnswerId) return

      const key = event.key
      const optionIndex = parseInt(key) - 1 // Chuyển 1,2,3,4 thành 0,1,2,3

      if (optionIndex >= 0 && optionIndex < options.length) {
        const selectedOption = options[optionIndex]
        if (selectedOption) {
          const isCorrect = selectedOption.id === correctAnswerId
          onAnswerSelect?.(selectedOption.id, isCorrect)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [options, selectedAnswerId, correctAnswerId, onAnswerSelect])

  const getAnswerStyle = (answerId) => {
    // Hiển thị đáp án ngay sau khi chọn (không cần đợi nộp bài)
    if (showResult || selectedAnswerId) {
      if (answerId === correctAnswerId) {
        return styles.answerCorrect
      }
      if (selectedAnswerId === answerId && answerId !== correctAnswerId) {
        return styles.answerWrong
      }
    }
    
    // Trước khi chọn
    return selectedAnswerId === answerId ? styles.answerSelected : styles.answer
  }

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

      {/* Answer Options - Lưới 2x2 */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Pressable
            key={option.id}
            style={({ pressed }) => [
              getAnswerStyle(option.id),
              pressed && !disabled && !showResult && styles.answerPressed,
            ]}
            onPress={() => handleAnswerPress(option.id)}
            disabled={disabled || selectedAnswerId === correctAnswerId} // Disable khi đã nộp bài hoặc đã chọn đúng
          >
            {/* Số thứ tự ở góc trên bên trái */}
            <View style={styles.optionNumber}>
              <Text style={styles.optionNumberText}>{index + 1}</Text>
            </View>
            
            <Text style={styles.answerText}>{option.text}</Text>
            
            {/* Icon checkmark/X ở bên phải - chỉ hiển thị khi đã chọn đáp án */}
            {(showResult || selectedAnswerId) && option.id === correctAnswerId ? (
              <Text style={styles.correctMark}>✓</Text>
            ) : (showResult || selectedAnswerId) && selectedAnswerId === option.id && option.id !== correctAnswerId ? (
              <Text style={styles.wrongMark}>✗</Text>
            ) : null}
          </Pressable>
        ))}
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
    backgroundColor: '#79964E', // Màu xanh lá
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
    paddingHorizontal: 40, // Tạo khoảng trống cho star icon
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF', // Text trắng
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
    flexWrap: 'wrap',
    width: '100%',
  },
  optionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  answer: {
    width: 'calc(50% - 6px)', // 2 cột trong lưới, trừ đi một nửa gap
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F', // Border đen
    borderStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56, // Đảm bảo chiều cao tối thiểu
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'borderColor, backgroundColor',
      transitionDuration: '200ms',
    }),
  },
  answerSelected: {
    width: 'calc(50% - 6px)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    borderStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    position: 'relative',
  },
  answerCorrect: {
    width: 'calc(50% - 6px)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#79964E', // Border xanh lá
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    position: 'relative',
  },
  answerWrong: {
    width: 'calc(50% - 6px)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F44336', // Border đỏ
    borderStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    position: 'relative',
  },
  answerPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  optionNumber: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  optionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  iconPlaceholder: {
    width: 24,
    height: 24,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    flex: 1,
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  correctMark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#79964E', // Màu xanh lá
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  wrongMark: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F44336', // Màu đỏ
    width: 24,
    height: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
})

