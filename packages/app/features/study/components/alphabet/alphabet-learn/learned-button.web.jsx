import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'

/**
 * LearnedButton: Nút đánh dấu đã học
 */
export function LearnedButton({ isLearned, onPress }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.button, isLearned && styles.buttonLearned]}
        onPress={onPress}
      >
        <Text style={[styles.text, isLearned && styles.textLearned]}>
          {isLearned ? '✓ Đã học' : 'Đánh dấu đã học'}
        </Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: '#F1BE4B',
    borderRadius: 8,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  buttonLearned: {
    backgroundColor: '#79964E',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  textLearned: {
    color: '#FFFFFF',
  },
})

