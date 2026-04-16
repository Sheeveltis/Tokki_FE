import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TopikBanner } from '@tokki/app/features/study/screens/menu-study/components/topik-banner.web'
import { SkillModulesGrid } from '@tokki/app/features/study/screens/menu-study/components/skill-modules-grid.web'
import { LoginRequest } from 'components/loginRequest'
import { StudyStatsCards } from '@tokki/app/features/study/components/study-stats-cards.web'

/**
 * MenuStudyMain (Web): Nội dung chính của trang menu học tập
 */
export function MenuStudyMain({ 
  levelId, 
  streakDays,
  isCompletedToday,
  lessonsLearned,
  onModulePress,
  showLoginRequest,
  onCloseLoginRequest,
  onAlphabetPress,
  onTopikRoadmapPress,
  aimLevel,
}) {

  return (
    <View style={styles.container}>
      {/* Header View: Banner & Stats integrated */}
      <View style={styles.headerDashboard}>
        <View style={styles.bannerContainer}>
          {/* Banner TOPIK Learning Path */}
          <TopikBanner 
            levelId={levelId} 
            onPress={onTopikRoadmapPress} 
            aimLevel={aimLevel} 
          />
          
          {/* Banner Học chữ cái - chỉ hiển thị cho level 1 */}
          {levelId === 1 && (
            <View style={{ marginTop: 16 }}>
              <TopikBanner
                title="HỌC CHỮ CÁI"
                onPress={onAlphabetPress}
                backgroundColor="#FF6B6B"
              />
            </View>
          )}
        </View>

        {/* Stats Section integrated to the side or top row */}
        <View style={styles.statsContainer}>
          <StudyStatsCards 
            lessonsLearned={lessonsLearned} 
            streakDays={streakDays} 
            isCompletedToday={isCompletedToday}
          />
        </View>
      </View>

      {/* Main Grid Section */}
      <View style={styles.contentSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Chương trình đào tạo</Text>
          <View style={styles.sectionDivider} />
        </View>
        <SkillModulesGrid levelId={levelId} onModulePress={onModulePress} />
      </View>

      {showLoginRequest && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LoginRequest onClose={onCloseLoginRequest} />
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 40,
  },
  headerDashboard: {
    width: '100%',
    flexDirection: 'row',
    gap: 24,
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  bannerContainer: {
    flex: 2,
    minWidth: 500,
    gap: 16,
  },
  statsContainer: {
    flex: 1,
    minWidth: 320,
    justifyContent: 'center',
  },
  contentSection: {
    gap: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#1A1A1A',
    textTransform: 'uppercase',
    letterSpacing: 2,
    opacity: 0.7,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0F0F0',
    opacity: 0.8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    paddingHorizontal: 16,
  },
  modalCard: {
    maxWidth: 640,
    width: '100%',
    alignItems: 'center',
  },
})

