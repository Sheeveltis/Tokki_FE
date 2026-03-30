import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native'
import { colors } from '../../../color'
import { studyStyles } from '../styles'
import { useRouter } from 'solito/navigation'

const LEVELS = [
  { id: 1, color: '#2E2E2E', hoverColor: colors.LightGreen },
  { id: 2, color: '#6F9581', hoverColor: colors.primaryLight },
  { id: 3, color: '#F5A6AC', hoverColor: colors.Pink },
  { id: 4, color: '#F9A42C', hoverColor: colors.Mustard },
  { id: 5, color: '#E5A7B7', hoverColor: colors.LightPink },
  { id: 6, color: '#F6BE1E', hoverColor: colors.accentYellow },
]

/**
 * StudyMain (Web): Nội dung chính của trang chọn lộ trình học
 */
export function StudyMain({ onSelectLevel, onShowModal, modalState }) {
  const router = useRouter()
  const rows = [LEVELS.slice(0, 3), LEVELS.slice(3)]
  const [hoveredLevel, setHoveredLevel] = useState(null)
  const [hoveredButton, setHoveredButton] = useState(null)

  const handleLevelPress = (levelId) => {
    if (onShowModal) {
      onShowModal(levelId)
    }
  }

  return (
    <>
      <View style={styles.container}>
        <View style={styles.mainCard}>
          <View style={styles.header}>
            <Text style={styles.title}>MENU HỌC</Text>
          </View>

          <View style={styles.levelGrid}>
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} style={styles.levelRow}>
                {row.map((level) => {
                  const isHovered = hoveredLevel === level.id
                  return (
                    <View key={level.id} style={styles.levelCardWrapper}>
                      <Pressable
                        style={({ pressed }) => [
                          styles.levelCard,
                          isHovered && [
                            styles.levelCardHovered,
                            { borderColor: level.hoverColor, backgroundColor: `${level.hoverColor}20` },
                          ],
                          pressed && styles.levelCardPressed,
                        ]}
                        onPress={() => handleLevelPress(level.id)}
                        onHoverIn={() => Platform.OS === 'web' && setHoveredLevel(level.id)}
                        onHoverOut={() => Platform.OS === 'web' && setHoveredLevel(null)}
                      >
                        <Text style={[styles.levelNumber, { color: level.color }]}>{level.id}</Text>
                      </Pressable>
                      <Text style={styles.levelLabel}>{`LEVEL ${level.id}`}</Text>
                    </View>
                  )
                })}
              </View>
            ))}
          </View>
        </View>
      </View>

    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center', // đưa khối chọn level ra giữa theo chiều dọc
    gap: 20,
    paddingVertical: 32,
    minHeight: '90vh', // đảm bảo full màn hình
  },
  header: {
    alignItems: 'center',
  },
  title: {
    ...studyStyles.cardTitle,
    marginBottom: 20,
  },
  mainCard: {
    width: '100%',
    maxWidth: 900,
    backgroundColor: '#F6F2E2',
    borderRadius: 16,
    paddingVertical: 50,
    paddingHorizontal: 32,
    alignItems: 'center',
    boxShadow: '0px 6px 12px rgba(0, 0, 0, 0.12)',
  },
  levelGrid: {
    gap: 60,
    width: '100%',
    alignItems: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 60,
  },
  levelCardWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  levelCard: {
    width: 130,
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, boxShadow, borderColor, backgroundColor',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
      cursor: 'pointer',
    }),
  },
  levelCardHovered: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2,
    boxShadow: 'none',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, borderColor, backgroundColor',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  levelCardPressed: {
    transform: [{ scale: 1.05 }],
    opacity: 0.9,
  },
  levelNumber: {
    fontSize: 40,
    fontWeight: '800',
  },
  levelLabel: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
    color: '#3C3C3C',
    letterSpacing: 0.4,
  },
})


