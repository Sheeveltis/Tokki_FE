import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { colors } from '../../../../color'

/**
 * StudyActionButtons: 2 nút hành động cho việc học
 * - Nút trái: Cần học lại
 * - Nút phải: Đã học
 */
export function StudyActionButtons({ onMarkAsNeedReview, onMarkAsLearned }) {
  return (
    <View style={styles.container}>
      <Pressable
        style={styles.buttonLeft}
        onPress={onMarkAsNeedReview}
      >
        <Text style={styles.textLeft}>← Cần học lại</Text>
      </Pressable>
      <Pressable
        style={styles.buttonRight}
        onPress={onMarkAsLearned}
      >
        <Text style={styles.textRight}>Đã học →</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  buttonLeft: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.wrong,
    borderRadius: 12,
    shadowColor: colors.wrong,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonRight: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    backgroundColor: colors.correct,
    borderRadius: 12,
    shadowColor: colors.correct,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  textLeft: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
  textRight: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Epilogue, sans-serif',
  },
})


