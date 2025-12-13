import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native'
import { Navbar } from 'components/navbar'
import { QuickLevelTestButton } from '../../quick-level-test-button.web'
import { StudyStatsCards } from '../../study-stats-cards.web'
import { NavigationPill } from 'components/navigation-pill'
import { studyStyles } from '../../../styles'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * MenuStudyLayout (Web): Bố cục trang menu học tập với width 70%
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
      <Navbar />
      
      {/* Bên trái: Nút kiểm tra level nhanh - nằm ngoài ScrollView */}
      <View style={styles.leftSide}>
        <QuickLevelTestButton onPress={onQuickTestPress} />
      </View>

      {/* Giữa: Content chính trong ScrollView với width 70% */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.contentWrapper}>
          {/* Nút Trở lại */}
          <View style={styles.backButtonContainer}>
            <NavigationPill
              label="Quay lại"
              to={undefined}
              icon={ArrowIcon}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
            />
          </View>

          {/* Title LEVEL */}
          <View style={styles.titleContainer}>
            <View style={styles.titleBox}>
              <Text style={styles.titleText}>LEVEL {levelId}</Text>
            </View>
          </View>

          {/* Nội dung chính */}
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
    paddingTop: 0,
    paddingBottom: 32,
    paddingHorizontal: 16,
    minHeight: '100%',
  },
  contentWrapper: {
    width: '70%',
    maxWidth: 1200,
    alignItems: 'center',
    gap: 24,
    backgroundColor: '#F5F0DD',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderRadius: 16,
  },
  backButtonContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderColor: '#F4B8AF',
    shadowColor: '#00000015',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  titleText: {
    ...studyStyles.pageTitle,
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

