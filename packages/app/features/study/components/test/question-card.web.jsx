import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import HeadphoneIcon from '../../../../../assets/icon/icon-mainflow/headphone.svg'
import { normalizeImageSource } from '../../api'

/**
 * QuestionCard: Component hiển thị một câu hỏi trắc nghiệm
 * @param {{
 *   question: string - Câu hỏi
 *   options: Array<{id: string, text: string}> - Danh sách đáp án
 *   correctAnswerId: string - ID đáp án đúng
 *   imageUrl?: string - URL hình ảnh (optional)
 *   onAnswerSelect?: (answerId: string, isCorrect: boolean) => void
 *   showResult?: boolean - Hiển thị kết quả sau khi nộp bài
 *   disabled?: boolean - Disable việc chọn đáp án (khi đã nộp bài)
 *   selectedAnswerId?: string - Đáp án đã chọn từ parent component
 * }}
 */
export function QuestionCard({
  question,
  options = [],
  correctAnswerId,
  imageUrl,
  onAnswerSelect,
  showResult = false,
  disabled = false,
  selectedAnswerId: propSelectedAnswerId,
}) {
  const [internalSelectedAnswerId, setInternalSelectedAnswerId] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Sử dụng prop từ parent nếu có, nếu không thì dùng state internal
  const selectedAnswerId = propSelectedAnswerId !== undefined ? propSelectedAnswerId : internalSelectedAnswerId

  const handleSelectAnswer = (answerId) => {
    if (selectedAnswerId !== null || disabled) return // Đã chọn rồi hoặc đã nộp bài thì không cho chọn lại
    
    if (propSelectedAnswerId === undefined) {
      setInternalSelectedAnswerId(answerId)
    }
    const isCorrect = answerId === correctAnswerId
    onAnswerSelect?.(answerId, isCorrect)
  }

  const isCorrect = selectedAnswerId === correctAnswerId
  // showResult = true khi đã nộp bài, hiển thị đáp án đúng cho tất cả câu hỏi

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerLabel}>Định nghĩa</Text>
          <Image
            source={normalizeImageSource(HeadphoneIcon)}
            style={styles.headphoneIcon}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>{question}</Text>

      {/* Content Row */}
      <View style={styles.contentRow}>
        {/* Options Grid */}
        <View style={styles.optionsContainer}>
          {options.map((option, index) => {
            const isSelected = selectedAnswerId === option.id
            const isCorrectAnswer = option.id === correctAnswerId
            const isWrong = isSelected && !isCorrectAnswer
            // Hiển thị đáp án đúng khi đã nộp bài
            const showCorrect = showResult && isCorrectAnswer
            // Hiển thị đáp án sai khi đã nộp bài và người dùng chọn sai
            const showWrong = showResult && isWrong

            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelectAnswer(option.id)}
                onHoverIn={() => Platform.OS === 'web' && !showResult && !disabled && setHoveredIndex(index)}
                onHoverOut={() => Platform.OS === 'web' && setHoveredIndex(null)}
                disabled={showResult || disabled}
                style={({ pressed }) => [
                  styles.optionCard,
                  isSelected && !showResult && styles.optionCardSelected,
                  showCorrect && styles.optionCardCorrect,
                  showWrong && styles.optionCardWrong,
                  (pressed || hoveredIndex === index) && !showResult && !disabled && styles.optionCardHovered,
                ]}
              >
                {/* Checkmark or X icon */}
                {(showCorrect || showWrong) && (
                  <View style={styles.iconContainer}>
                    {showCorrect ? (
                      <Text style={styles.checkIcon}>✓</Text>
                    ) : (
                      <Text style={styles.xIcon}>✗</Text>
                    )}
                  </View>
                )}
                <Text
                  style={[
                    styles.optionText,
                    showCorrect && styles.optionTextCorrect,
                    showWrong && styles.optionTextWrong,
                  ]}
                >
                  {option.text}
                </Text>
              </Pressable>
            )
          })}
        </View>

        {/* Image */}
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={normalizeImageSource(imageUrl)}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  headphoneIcon: {
    width: 20,
    height: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  contentRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  optionCard: {
    width: 'calc(50% - 8px)',
    minWidth: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F1F',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'border-color, background-color, transform',
      transitionDuration: '150ms',
    }),
  },
  optionCardHovered: {
    borderColor: '#F1BE4B',
    backgroundColor: '#FFFBF0',
    transform: [{ scale: 1.02 }],
  },
  optionCardSelected: {
    borderColor: '#1F1F1F',
  },
  optionCardCorrect: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderStyle: 'dashed',
    backgroundColor: '#F1F8F4',
  },
  optionCardWrong: {
    borderColor: '#F44336',
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIcon: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: '700',
  },
  xIcon: {
    fontSize: 18,
    color: '#F44336',
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  optionTextCorrect: {
    color: '#4CAF50',
  },
  optionTextWrong: {
    color: '#F44336',
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
})

