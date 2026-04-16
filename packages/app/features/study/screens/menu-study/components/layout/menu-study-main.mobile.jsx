import React from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { TopikBanner } from '../topik-banner'
import { SkillModulesGrid } from '../skill-modules-grid'
import { LoginRequest } from 'components/loginRequest'

/**
 * MenuStudyMain (Mobile): Nội dung chính của trang menu học tập
 */
export function MenuStudyMain({ 
  levelId, 
  onModulePress,
  showLoginRequest,
  onCloseLoginRequest,
  onAlphabetPress,
  onTopikRoadmapPress,
  aimLevel,
}) {

  return (
    <View style={styles.container}>
      {/* Banner Học chữ cái - chỉ hiển thị cho level 1 */}
      {levelId === 1 && (
        <TopikBanner
          title="HỌC CHỮ CÁI"
          onPress={onAlphabetPress}
          aimLevel={aimLevel}
        />
      )}

      {/* Banner TOPIK Learning Path */}
      <TopikBanner levelId={levelId} onPress={onTopikRoadmapPress} aimLevel={aimLevel} />
      

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
    gap: 12,
    paddingTop: 4,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
  },
  modalCard: {
    maxWidth: '90%',
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 10px 20px rgba(0,0,0,0.25)',
    } : {
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    }),
  },
})

