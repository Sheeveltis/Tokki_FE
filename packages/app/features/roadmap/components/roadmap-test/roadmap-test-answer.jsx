import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export function RoadmapTestAnswer({
  selectedAnswer = null,
  onAnswerSelect,
  containerStyle,
  buttonSize = 40,
  gap = 12,
}) {
  const handleAnswerSelect = (answerIndex) => {
    if (onAnswerSelect) {
      // Nếu click vào đáp án đã chọn thì bỏ chọn (toggle)
      if (selectedAnswer === answerIndex) {
        onAnswerSelect(null)
      } else {
        onAnswerSelect(answerIndex)
      }
    }
  }

  return (
    <View style={[styles.container, containerStyle, { gap }]}>
      {[1, 2, 3, 4].map((num) => {
        // selectedAnswer được lưu dạng 1-based (1, 2, 3, 4) để khớp với logic buildMcqAnswersPayload
        const isSelected = selectedAnswer === num
        return (
          <Pressable
            key={num}
            onPress={() => handleAnswerSelect(num)}
            style={[
              styles.answerButton,
              { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
              isSelected && styles.answerButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.answerButtonText,
                isSelected && styles.answerButtonTextSelected,
              ]}
            >
              {num}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  answerButton: {
    borderWidth: 2,
    borderColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  answerButtonSelected: {
    backgroundColor: '#FFDC9C',
    borderWidth: 3,
  },
  answerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  answerButtonTextSelected: {
    fontWeight: '800',
  },
})

