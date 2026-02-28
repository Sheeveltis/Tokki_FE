import React from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'

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
                  (isWon || isOutOfAttempts) && styles.levelItemWon,
                ]}
                disabled={isDisabled}
                onPress={() => handleLevelPress(level.id)}
              >
                <View style={styles.levelLeft}>
                  <Image
                    source={normalizeImageSource(level.bunny)}
                    style={[styles.bunny, isWon && styles.bunnyWon]}
                    resizeMode="contain"
                  />
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
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  card: {
    width: '90%',
    maxWidth: 480,
    backgroundColor: '#FFF5E6',
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 20,
  },
  levelList: {
    gap: 16,
  },
  levelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#FFE9C4',
    borderWidth: 2,
    borderColor: '#FFE0B2',
  },
  levelItemSelected: {
    backgroundColor: '#FFA726',
    borderColor: '#FB8C00',
  },
  levelItemWon: {
    backgroundColor: '#E0E0E0',
    borderColor: '#BDBDBD',
    opacity: 0.5,
  },
  bunnyWon: {
    opacity: 0.5,
  },
  levelTextWon: {
    color: '#9E9E9E',
  },
  levelLeft: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bunny: {
    width: 48,
    height: 48,
  },
  levelTextWrapper: {
    flex: 1,
    paddingLeft: 8,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3E2723',
  },
  levelDesc: {
    marginTop: 4,
    fontSize: 15,
    color: '#4E342E',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CFD8DC',
  },
  confirmButton: {
    backgroundColor: '#7CB342',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

export default WordleLevelPopup


