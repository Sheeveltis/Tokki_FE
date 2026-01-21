import React from 'react'
import { View, StyleSheet } from 'react-native'

/**
 * LearnedVocabularyPracticeLayout (Web): Layout cho trang practice từ vựng trên web
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
    paddingVertical: 32,
    paddingHorizontal: 16,
    minHeight: '100vh',
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 1200,
    minHeight: '70vh',
    gap: 16,
    alignItems: 'stretch',
    backgroundColor: '#F5F0DD',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
})

