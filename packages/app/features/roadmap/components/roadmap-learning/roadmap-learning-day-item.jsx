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
    gap: 16,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFF8F0',
    alignItems: 'flex-start',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'transform, box-shadow, background-color',
      transitionDuration: '160ms',
      transitionTimingFunction: 'ease-out',
    }),
  },
  containerHovered: {
    backgroundColor: '#FFF3E3',
    transform: [{ translateY: -1 }],
  },
  containerActive: {
    borderWidth: 2,
    borderColor: '#F4A950',
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#F4E5C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5C4A2B',
    fontFamily: 'Epilogue, sans-serif',
  },
  contentWrapper: {
    flex: 1,
    gap: 12,
  },
  headerSection: {
    marginBottom: 4,
  },
  content: {
    flex: 1,
    gap: 10,
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transitionProperty: 'max-height, opacity',
      transitionDuration: '750ms',
      transitionTimingFunction: 'ease-in-out',
    }),
  },
  contentExpanded: {
    maxHeight: 1000,
    opacity: 1,
  },
  contentCollapsed: {
    maxHeight: 0,
    opacity: 0,
  },
})

