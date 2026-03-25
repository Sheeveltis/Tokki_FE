import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native'
import { Navbar } from '../../../../../../../components/navbar'
import { QuickLevelTestButton } from '../../../../components/quick-level-test-button.web'
import { StudyStatsCards } from '../../../../components/study-stats-cards.web'
import { useRouter } from 'solito/navigation'
import { studyStyles } from '../../../../styles'

/**
 * MenuStudyLayout (Web): Bố cục trang menu học tập hiện đại theo phong cách dashboard
 */
export function MenuStudyLayout({
  children,
  levelId,
  onBackPress,
  onQuickTestPress,
  lessonsLearned,
  streakDays,
}) {
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainWrapper}>
        {/* Header Navigation - Synchronized with Roadmap Dashboard Style */}
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <View style={styles.headerLeft}>
              <Pressable 
                onPress={onBackPress} 
                style={({ pressed }) => [styles.exitButton, pressed && styles.actionButtonPressed]}
              >
                <Text style={styles.exitIcon}>←</Text>
                <Text style={styles.exitText}>Trở lại</Text>
              </Pressable>
              <View style={styles.headerDivider} />
              <View style={styles.breadcrumb}>
                <Text style={styles.breadcrumbText}>Học tập</Text>
                <Text style={styles.breadcrumbDivider}>/</Text>
                <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Chọn kỹ năng</Text>
              </View>
            </View>

            <View style={styles.dashboardTitle}>
              <View style={styles.titleBadge}>
                <Text style={styles.titleBadgeText}>HỆ THỐNG HỌC TẬP</Text>
              </View>
              <Text style={styles.mainTitle}>TOPIK LEVEL {levelId}</Text>
            </View>

            <View style={styles.headerRight}>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreLabel}>TIẾN ĐỘ</Text>
                <Text style={styles.scoreValue}>{lessonsLearned || 0}%</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Dashboard Content Area */}
        <View style={styles.dashboardBody}>
          {/* Left Column: Quick Actions */}
          <View style={styles.leftColumn}>
            <View style={styles.columnCard}>
              <Text style={styles.columnLabel}>KIỂM TRA NHANH</Text>
              <QuickLevelTestButton onPress={onQuickTestPress} />
            </View>
          </View>

          {/* Center Column: Main Content (Banners + Grid) */}
          <View style={styles.centerColumn}>
            <ScrollView 
              style={styles.mainScroll} 
              contentContainerStyle={styles.mainScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          </View>

          {/* Right Column: User Stats */}
          <View style={styles.rightColumn}>
            <View style={styles.columnCard}>
              <Text style={styles.columnLabel}>THỐNG KÊ CÁ NHÂN</Text>
              <StudyStatsCards lessonsLearned={lessonsLearned} streakDays={streakDays} />
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    height: '100vh',
    overflow: 'hidden',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    height: 90,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 10,
    ...(Platform.OS === 'web' && { boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }),
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    flex: 1,
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  exitIcon: {
    fontSize: 18,
    color: '#333',
    fontWeight: '700',
  },
  exitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
  },
  headerDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#EEE',
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
  },
  breadcrumbDivider: {
    fontSize: 13,
    color: '#EEE',
  },
  breadcrumbActive: {
    color: '#1A1A1A',
    fontWeight: '700',
  },
  dashboardTitle: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  titleBadge: {
    backgroundColor: '#FFF2CC',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  titleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C28A04',
    letterSpacing: 1,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  scoreBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#F1F9F1',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E1EEDD',
  },
  scoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2E7D32',
  },
  dashboardBody: {
    flex: 1,
    flexDirection: 'row',
    padding: 24,
    gap: 24,
    backgroundColor: '#FAF9F6',
  },
  leftColumn: {
    width: 280,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  rightColumn: {
    width: 320,
    display: Platform.OS === 'web' ? 'flex' : 'none',
  },
  centerColumn: {
    flex: 1,
    height: '100%',
  },
  columnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }),
  },
  columnLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    gap: 24,
    paddingBottom: 40,
  },
  actionButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.8,
  },
})
