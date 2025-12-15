import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { colors } from '../../../../color'
import { studyStyles } from '../../../styles'
import BunnyReading from '../../../../../../assets/bunny/4.png'

const LEVELS = [
  { id: 1, color: '#2E2E2E', hoverColor: colors.LightGreen },
  { id: 2, color: '#6F9581', hoverColor: colors.primaryLight },
  { id: 3, color: '#F5A6AC', hoverColor: colors.Pink },
  { id: 4, color: '#F9A42C', hoverColor: colors.Mustard },
  { id: 5, color: '#E5A7B7', hoverColor: colors.LightPink },
  { id: 6, color: '#F6BE1E', hoverColor: colors.accentYellow },
]

/**
 * StudySelectionMain (Web): Nội dung chính của trang chọn lộ trình học
 */
export function StudySelectionMain({ 
  onSelectLevel,
  hoveredLevel,
  onHoverIn,
  onHoverOut,
}) {
  const rows = [LEVELS.slice(0, 3), LEVELS.slice(3)]

  return (
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
                      onPress={() => onSelectLevel?.(level.id)}
                      onHoverIn={() => onHoverIn(level.id)}
                      onHoverOut={onHoverOut}
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

      <Image source={BunnyReading} style={styles.bunny} resizeMode="contain" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
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
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F4B8AF',
    shadowColor: '#00000025',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
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
    shadowColor: '#00000015',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F1F1',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, shadowOpacity, shadowRadius, borderColor, backgroundColor',
      transitionDuration: '200ms',
      transitionTimingFunction: 'ease-out',
      cursor: 'pointer',
    }),
  },
  levelCardHovered: {
    transform: [{ scale: 1.08 }],
    borderWidth: 2,
    shadowOpacity: 0,
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
    fontSize: 42,
    fontWeight: '800',
    fontFamily: 'Epilogue, sans-serif',
  },
  levelLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '700',
    color: '#3C3C3C',
    letterSpacing: 0.4,
    fontFamily: 'Epilogue, sans-serif',
  },
  bunny: {
    width: 210,
    height: 210,
  },
})

