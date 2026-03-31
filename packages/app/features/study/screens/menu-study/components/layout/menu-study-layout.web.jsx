import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native'
import { Navbar } from 'components/navbar'
import { QuickLevelTestButton } from '@tokki/app/features/study/components/quick-level-test-button.web'
import { StudyStatsCards } from '@tokki/app/features/study/components/study-stats-cards.web'
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
}) {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation - Synchronized with Roadmap */}
          <View style={styles.topNavigation}>
            <View style={styles.breadcrumb}>
              <Pressable onPress={onBackPress} style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbText}>Học tập</Text>
              </Pressable>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Chọn kỹ năng</Text>
            </View>
          </View>

          {/* Hero Header Section - Synchronized with Roadmap */}
          <View style={styles.heroSection}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <View style={styles.badgeRow}>
                  <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>HỆ THỐNG HỌC TẬP</Text>
                  </View>
                  <View style={[styles.levelBadge, { backgroundColor: '#FF6B6B' }]}>
                    <Text style={styles.levelBadgeText}>Level {levelId}</Text>
                  </View>
                </View>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.mainTitle}>Chương trình học TOPIK</Text>
                </View>
                <Text style={styles.subtitle}>Lựa chọn kỹ năng bạn muốn rèn luyện hôm nay để chinh phục điểm số cao nhất.</Text>
              </View>


            </View>
          </View>

          {/* Main Dashboard - Sidebar Layout */}
          <View style={styles.dashboardContainer}>
            {/* Sidebar bên trái: Actions & Stats */}
            <View style={styles.sidebar}>
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>CÔNG CỤ HỖ TRỢ</Text>
                <View style={styles.columnCard}>
                  <QuickLevelTestButton onPress={onQuickTestPress} />
                </View>
              </View>

              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>THỐNG KÊ CÁ NHÂN</Text>
                <View style={styles.columnCard}>
                  <StudyStatsCards lessonsLearned={lessonsLearned} streakDays={streakDays} />
                </View>
              </View>
            </View>

            {/* Content Card bên phải */}
            <View style={styles.contentCard}>
              <ScrollView 
                style={styles.contentCardScroll} 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentCardInner}
              >
                {children}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    minHeight: '100vh',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1600,
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 32,
    gap: 20,
    alignSelf: 'center',
  },
  topNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breadcrumbItem: {
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
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
  heroSection: {
    gap: 20,
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  headerText: {
    flex: 1,
    gap: 8,
    minWidth: 300,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  phaseBadge: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  phaseBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#666',
    textTransform: 'uppercase',
  },
  levelBadge: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 40,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Epilogue, sans-serif',
    maxWidth: 600,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardContainer: {
    flexDirection: 'row',
    gap: 24,
    flex: 1,
    overflow: 'hidden',
    paddingBottom: 10,
  },
  sidebar: {
    width: 280,
    height: '100%',
    gap: 24,
  },
  sidebarSection: {
    gap: 12,
  },
  sidebarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#999',
    letterSpacing: 1.5,
    paddingHorizontal: 12,
  },
  columnCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }),
  },
  contentCard: {
    flex: 1,
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && { boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }),
  },
  contentCardScroll: {
    flex: 1,
  },
  contentCardInner: {
    padding: 32,
    gap: 24,
  },
})
