import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native'

export function RoadmapLearningDayItem({ dayIndex, isActive, onPress, header, children }) {
  const dayLabel = `Ngày ${dayIndex}`
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setIsHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setIsHovered(false)}
      style={({ pressed }) => [
        styles.container,
        isActive && styles.containerActive,
        isHovered && styles.containerHovered,
        pressed && styles.containerPressed,
      ]}
    >
      <View style={styles.dayBadge}>
        <Text style={styles.dayBadgeText}>{dayLabel}</Text>
      </View>
      <View style={styles.contentWrapper}>
        <View style={styles.headerSection}>{header}</View>
        <View
          style={[
            styles.content,
            isActive ? styles.contentExpanded : styles.contentCollapsed,
          ]}
        >
          {children}
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#F3D8AA',
    backgroundColor: '#FFF8F0',
    alignItems: 'flex-start',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow, background-color, border-color',
      transitionDuration: '160ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  containerHovered: {
    backgroundColor: '#FFF3E3',
    borderColor: '#F4A950',
    transform: [{ translateY: -1 }],
  },
  containerActive: {
    borderWidth: 2,
    borderColor: '#F4A950',
    backgroundColor: '#FFF5E5',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  containerPressed: {
    opacity: 1,
  },
  dayBadge: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F4E5C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C4A2B',
    fontFamily: 'Epilogue, sans-serif',
  },
  contentWrapper: {
    flex: 1,
    gap: 8,
    minWidth: 0,
  },
  headerSection: {
    marginBottom: 0,
  },
  content: {
    flex: 1,
    gap: 8,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'max-height, opacity',
      transitionDuration: '300ms',
      transitionTimingFunction: 'ease-in-out',
    }),
  },
  contentExpanded: {
    maxHeight: 1200,
    opacity: 1,
  },
  contentCollapsed: {
    maxHeight: 0,
    opacity: 0,
  },
})

