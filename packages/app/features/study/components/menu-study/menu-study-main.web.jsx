import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TopikBanner } from './topik-banner.web'
import { SkillModulesGrid } from './skill-modules-grid.web'
import { LoginRequest } from 'components/loginRequest'

/**
 * MenuStudyMain (Web): Nội dung chính của trang menu học tập
 */
export function MenuStudyMain({ levelId, onModulePress }) {
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleModulePress = (moduleId) => {
    if (moduleId === 'speaking' || moduleId === 'writing') {
      setShowLoginRequest(true)
      return
    }
    onModulePress?.(moduleId)
  }

  return (
    <View style={styles.container}>
      {/* Banner TOPIK Learning Path */}
      <TopikBanner levelId={levelId} />

      {/* Grid các skill modules */}
      <SkillModulesGrid levelId={levelId} onModulePress={handleModulePress} />

      {showLoginRequest && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LoginRequest onClose={() => setShowLoginRequest(false)} />
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
    backgroundColor: '#00000055',
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


