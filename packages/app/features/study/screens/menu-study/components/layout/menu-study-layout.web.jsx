import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native'
import { useRouter } from 'solito/navigation'

/**
 * MenuStudyLayout (Web): Bố cục trang menu học tập đồng bộ với phong cách Roadmap Dashboard
 */
export function MenuStudyLayout({
  children,
  levelId,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
  aimLevel,
}) {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainWrapper}>
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFDF5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 20,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1280,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
})
