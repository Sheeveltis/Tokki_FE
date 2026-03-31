import React from 'react'
import { View, Text, StyleSheet, ScrollView, Platform, Pressable } from 'react-native'
import { Navbar } from 'components/navbar'

/**
 * StudyLayoutSynchronized (Web): Bố cục trang học tập đồng bộ với phong cách Roadmap Dashboard và Menu Study
 */
export function StudyLayoutSynchronized({
  children,
  levelId,
  onBackPress,
  title = "Chương trình học TOPIK",
  subtitle = "Lựa chọn kỹ năng bạn muốn rèn luyện hôm nay để chinh phục điểm số cao nhất.",
  breadcrumbPrefix = "Học tập",
  breadcrumbActive = "Chi tiết",
  showSidebar = true,
  headerBadge = "HỆ THỐNG HỌC TẬP",
  headerActions,
  sidebarActions
}) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.mainContainer}>
        <View style={styles.mainWrapper}>
          {/* Top Bar Navigation */}
          <View style={styles.topNavigation}>
            <View style={styles.breadcrumb}>
              <Pressable onPress={onBackPress} style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbText}>{breadcrumbPrefix}</Text>
              </Pressable>
              <Text style={styles.breadcrumbDivider}>/</Text>
              <Text style={[styles.breadcrumbText, styles.breadcrumbActive]}>{breadcrumbActive}</Text>
            </View>
          </View>

          {/* Hero Header Section */}
          <View style={styles.heroSection}>
            <View style={styles.headerTop}>
              <View style={styles.headerText}>
                <View style={styles.badgeRow}>
                  {/* <View style={styles.phaseBadge}>
                    <Text style={styles.phaseBadgeText}>{headerBadge}</Text>
                  </View> */}
                  {/* {levelId && (
                    <View style={[styles.levelBadge, { backgroundColor: '#FF6B6B' }]}>
                      <Text style={styles.levelBadgeText}>Level {levelId}</Text>
                    </View>
                  )} */}
                </View>
                <View style={styles.heroTitleRow}>
                  <Text style={styles.mainTitle}>{title}</Text>
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>

              {headerActions && (
                <View style={styles.headerActions}>
                  {headerActions}
                </View>
              )}
            </View>
          </View>

          {/* Main Dashboard - Sidebar Layout */}
          <View style={styles.dashboardContainer}>
            {/* Sidebar bên trái: Actions */}
            {showSidebar && sidebarActions && (
              <View style={styles.sidebar}>
                <View style={styles.sidebarSection}>
                  <Text style={styles.sidebarTitle}>CÔNG CỤ HỖ TRỢ</Text>
                  <View style={styles.columnCard}>
                    {sidebarActions}
                  </View>
                </View>
              </View>
            )}

            {/* Content Card bên phải */}
            <View style={[styles.contentCard, (!showSidebar || !sidebarActions) && { flex: 1 }]}>
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
    maxWidth: 1400,
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 4,
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
    paddingHorizontal: 12,
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
