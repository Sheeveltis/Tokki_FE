import React, { forwardRef } from 'react'
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native'

/**
 * TypingInput: Input field với feedback
 */
export const TypingInput = forwardRef(({
  value,
  onChangeText,
  onSubmitEditing,
  onKeyPress,
  isCorrect,
  correctAnswer,
  placeholder = 'Nhập chữ cái...',
}, ref) => {
  return (
    <View style={styles.container}>
      <TextInput
        ref={ref}
        style={[
          styles.input,
          isCorrect === true && styles.inputCorrect,
          isCorrect === false && styles.inputIncorrect,
        ]}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onKeyPress={onKeyPress}
        placeholder={placeholder}
        placeholderTextColor="#B0B0B0"
        autoFocus={Platform.OS === 'web'}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {isCorrect === true && (
        <Text style={styles.feedbackCorrect}>✓ Đúng!</Text>
      )}
      {isCorrect === false && (
        <Text style={styles.feedbackIncorrect}>
          ✗ Sai! Đáp án đúng: {correctAnswer}
        </Text>
      )}
    </View>
  )
})

TypingInput.displayName = 'TypingInput'

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 500,
    gap: 8,
  },
  input: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E0E0E0',
    fontFamily: 'Epilogue, sans-serif',
  },
  inputCorrect: {
    borderColor: '#79964E',
    backgroundColor: '#F0F9E8',
  },
  inputIncorrect: {
    borderColor: '#FF4D4F',
    backgroundColor: '#FFF0F0',
  },
  feedbackCorrect: {
    fontSize: 18,
    fontWeight: '700',
    color: '#79964E',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
  feedbackIncorrect: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF4D4F',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
  },
})

