import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * LearnedVocabularyPracticeLayout (Mobile): Layout cho trang practice từ vựng trên mobile
 */
export function LearnedVocabularyPracticeLayout({ children }) {
  return (
    <View style={styles.root}>
      <View style={styles.contentWrapper}>
        {children}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    gap: 16,
    alignItems: 'stretch',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderRadius: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
})

