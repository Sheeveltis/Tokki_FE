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
  aimLevel,
}) {
  const router = useRouter()
  const isTarget = levelId && aimLevel && Number(levelId) === Number(aimLevel)

  return (
    <View style={styles.wrapper}>
      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation - Synchronized with Roadmap */}
          <View style={styles.topNavigation}>
            <View style={styles.breadcrumb}>
              <Pressable onPress={onBackPress} style={styles.breadcrumbItem}>
                <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>Học tập</Text>
              </Pressable>
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
                  {levelId && (
                    <View style={[styles.levelBadge, { backgroundColor: isTarget ? '#2E7D32' : '#FF6B6B' }]}>
                      <Text style={styles.levelBadgeText}>
                        Level {levelId} {isTarget ? '• MỤC TIÊU' : ''}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.mainTitle}>Chương trình học TOPIK</Text>
                </View>
                <Text style={styles.subtitle}>Bắt đầu hành trình chinh phục tiếng Hàn với chương trình học tập tối ưu dành riêng cho bạn.</Text>
              </View>


            </View>
          </View>

          {/* Main Dashboard - Single Column Layout */}
          <View style={styles.dashboardContainer}>
            {/* Content Area */}
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
    overflow: 'hidden',
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    overflow: 'hidden',
  },
  mainWrapper: {
    width: '100%',
    maxWidth: 1400,
    flex: 1,
    paddingTop: 24,
    paddingBottom: 24,
    gap: 20,
    alignSelf: 'center',
    overflow: 'hidden',
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
    // maxWidth: 600,
    lineHeight: 22,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashboardContainer: {
    flex: 1,
    overflow: 'hidden',
    paddingBottom: 10,
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
