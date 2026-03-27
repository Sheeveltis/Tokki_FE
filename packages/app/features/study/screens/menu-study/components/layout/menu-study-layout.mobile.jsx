import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'
import { NavbarMobile } from '../../../../../../../components/navbar-mobile'
import { studyStyles } from '../../../../styles'

/**
 * MenuStudyLayout (Mobile): Bố cục trang menu học tập cho mobile
 */
export function MenuStudyLayout({
  children,
  levelId,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
}) {
  return (
    <View style={styles.root}>
      <NavbarMobile />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.badgeRow}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>LEVEL {levelId}</Text>
              </View>
            </View>
            <Text style={styles.mainTitle}>Học tập kỹ năng</Text>
          </View>
        </View>

        <View style={styles.contentWrapper}>
          {children}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    padding: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTop: {
    gap: 8,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  levelBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#C28A04',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  contentWrapper: {
    padding: 16,
    gap: 20,
  },
})
