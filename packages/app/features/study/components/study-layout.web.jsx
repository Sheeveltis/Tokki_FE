import React from 'react'
import { View, StyleSheet, ScrollView, Platform } from 'react-native'
import { Navbar } from 'components/navbar'
import { QuickLevelTestButton } from './quick-level-test-button.web'
import { StudyStatsCards } from './study-stats-cards.web'

/**
 * StudyLayout (Web): Bố cục chung với button bên trái và stats bên phải
 */
export function StudyLayout({ children, onQuickTestPress, lessonsLearned, streakDays }) {
  return (
    <View style={styles.root}>
      <Navbar />
      
      {/* Bên trái: Nút kiểm tra level nhanh - nằm ngoài ScrollView */}
      <View style={styles.leftSide}>
        <QuickLevelTestButton onPress={onQuickTestPress} />
      </View>

      {/* Giữa: Content chính trong ScrollView */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContent}>
          {children}
        </View>
      </ScrollView>

      {/* Bên phải: Thống kê học tập - nằm ngoài ScrollView */}
      <View style={styles.rightSide}>
        <StudyStatsCards lessonsLearned={lessonsLearned} streakDays={streakDays} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFD7D0',
    position: 'relative',
  },
  scrollContent: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
  centerContent: {
    width: '100%',
    maxWidth: 900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftSide: {
    position: 'absolute',
    left: 40,
    top: 100,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
    }),
  },
  rightSide: {
    position: 'absolute',
    right: 40,
    top: 100,
    zIndex: 10,
    ...(Platform.OS === 'web' && {
      position: 'fixed',
    }),
  },
})


