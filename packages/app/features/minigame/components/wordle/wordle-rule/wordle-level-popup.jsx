import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'

import EasyBunny from '../../../../../../assets/bunny/14.png'
// Tạm thời dùng cùng một hình bunny cho cả 3 mức độ (trong assets hiện chỉ có 14.png)
import MediumBunny from '../../../../../../assets/bunny/14.png'
import HardBunny from '../../../../../../assets/bunny/14.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

/**
 * Popup chọn mức độ cho Wordle (format giống solitaire / matching card)
 * Props:
 * - loading: boolean
 * - levelsData: Array<{ level: number, isWon: boolean, ... }>
 * - onClose: () => void
 * - onSelectLevel: (levelId: 1|2|3) => void
 */
export function WordleLevelPopup({ loading, levelsData = [], onClose, onSelectLevel }) {
  const levels = [
    { id: 1, label: 'Mức độ', desc: 'Dễ', bunny: EasyBunny },
    { id: 2, label: 'Mức độ', desc: 'Trung bình', bunny: MediumBunny },
    { id: 3, label: 'Mức độ', desc: 'Khó', bunny: HardBunny },
  ]

  // Map status từ levelsData (won + hết lượt chơi)
  const levelsWithStatus = levels.map((level) => {
    const levelData = levelsData.find((ld) => ld.level === level.id)
    const attemptCount = levelData?.attemptCount ?? 0
    const maxAttempts = levelData?.maxAttempts ?? 0
    const isWon = !!levelData?.isWon
    const isOutOfAttempts = maxAttempts > 0 && attemptCount >= maxAttempts

    return {
      ...level,
      isWon,
      isOutOfAttempts,
      attemptCount,
      maxAttempts,
    }
  })

  // Tìm level đầu tiên chưa won và chưa hết lượt để làm default
  const defaultLevel =
    levelsWithStatus.find((l) => !l.isWon && !l.isOutOfAttempts) || levelsWithStatus[1]
  const [selectedId, setSelectedId] = React.useState(defaultLevel?.id || 2)

  const handleConfirm = () => {
    if (loading) return
    const selectedLevel = levelsWithStatus.find((l) => l.id === selectedId)
    // Không cho confirm nếu level đã won hoặc đã dùng hết lượt chơi
    if (selectedLevel?.isWon || selectedLevel?.isOutOfAttempts) return
    onSelectLevel(selectedId)
  }

  const handleLevelPress = (levelId) => {
    const level = levelsWithStatus.find((l) => l.id === levelId)
    // Không cho chọn level đã won hoặc đã hết lượt
    if (level?.isWon || level?.isOutOfAttempts) return
    setSelectedId(levelId)
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>Chọn mức độ</Text>

        <View style={styles.levelList}>
          {levelsWithStatus.map((level) => {
            const isSelected = level.id === selectedId
            const isWon = level.isWon
            const isOutOfAttempts = level.isOutOfAttempts
            const isDisabled = isWon || isOutOfAttempts || loading
            return (
              <Pressable
                key={level.id}
                style={[
                  styles.levelItem,
                  isSelected && !isWon && !isOutOfAttempts && styles.levelItemSelected,
                  (isWon || isOutOfAttempts) && styles.levelItemDisabled,
                ]}
                disabled={isDisabled}
                onPress={() => handleLevelPress(level.id)}
              >
                <View style={styles.levelLeft}>
                  <View style={[styles.iconContainer, isSelected && !isWon && !isOutOfAttempts && styles.iconContainerActive]}>
                    <Image
                      source={normalizeImageSource(level.bunny)}
                      style={[styles.bunny, isWon && styles.bunnyWon]}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={styles.levelTextWrapper}>
                  <Text style={[styles.levelLabel, isWon && styles.levelTextWon]}>
                    {level.label}
                  </Text>
                  <Text style={[styles.levelDesc, isWon && styles.levelTextWon]}>
                    {level.desc}
                  </Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              styles.cancelButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Hủy</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              styles.confirmButton,
              pressed && { opacity: 0.9 },
            ]}
            disabled={loading}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmText}>Xác nhận</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 250, 250, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    elevation: 20,
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
    }),
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Epilogue, sans-serif',
  },
  levelList: {
    gap: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),
  },
  levelItemSelected: {
    backgroundColor: '#FEF7E6',
    borderColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(241, 190, 75, 0.15)',
    }),
  },
  levelItemDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#F5F5F5',
    opacity: 0.6,
  },
  bunnyWon: {
    opacity: 0.5,
  },
  levelTextWon: {
    color: '#999',
  },
  levelLeft: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: '#FFFFFF',
  },
  bunny: {
    width: 48,
    height: 48,
  },
  levelTextWrapper: {
    flex: 1,
    gap: 4,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelDesc: {
    fontSize: 15,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    minWidth: 120,
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  confirmButton: {
    backgroundColor: '#F1BE4B',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
})

export default WordleLevelPopup


