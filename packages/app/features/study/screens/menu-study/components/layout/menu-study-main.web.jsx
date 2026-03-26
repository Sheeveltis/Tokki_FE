import React from 'react'
import { View, StyleSheet } from 'react-native'
import { TopikBanner } from '@tokki/app/features/study/screens/menu-study/components/topik-banner.web'
import { SkillModulesGrid } from '@tokki/app/features/study/screens/menu-study/components/skill-modules-grid.web'
import { LoginRequest } from 'components/loginRequest'

/**
 * MenuStudyMain (Web): Nội dung chính của trang menu học tập
 */
export function MenuStudyMain({ 
  levelId, 
  onModulePress,
  showLoginRequest,
  onCloseLoginRequest,
  onAlphabetPress,
  onTopikRoadmapPress,
}) {

  return (
    <View style={styles.container}>
      {/* Banner Học chữ cái - chỉ hiển thị cho level 1 */}
      {levelId === 1 && (
        <TopikBanner
          title="HỌC CHỮ CÁI"
          onPress={onAlphabetPress}
        />
      )}

      {/* Banner TOPIK Learning Path */}
      <TopikBanner levelId={levelId} onPress={onTopikRoadmapPress} />
      

      {/* Grid các skill modules */}
      <SkillModulesGrid levelId={levelId} onModulePress={onModulePress} />

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
    alignItems: 'center',
    gap: 24,
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

