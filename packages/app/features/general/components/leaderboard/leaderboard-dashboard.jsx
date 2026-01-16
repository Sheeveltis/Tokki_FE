'use client'

import React, { useState } from 'react'
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native'

const TIME_FRAMES = [
  { id: 0, label: 'Ngày', value: 0 },
  { id: 1, label: 'Tuần', value: 1 },
  { id: 2, label: 'Tháng', value: 2 },
  { id: 3, label: 'Tất cả', value: 3 },
]

/**
 * Dashboard component với các tab để chọn timeFrame
 * @param {Object} props
 * @param {number} props.selectedTimeFrame - TimeFrame đang được chọn (0-3)
 * @param {Function} props.onTimeFrameChange - Callback khi timeFrame thay đổi
 */
export function LeaderboardDashboard({ selectedTimeFrame = 0, onTimeFrameChange }) {
  const handleSelect = (value) => {
    if (typeof onTimeFrameChange === 'function') {
      onTimeFrameChange(value)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bảng xếp hạng</Text>
      <View style={styles.tabsContainer}>
        {TIME_FRAMES.map((frame) => {
          const isSelected = selectedTimeFrame === frame.value
          return (
            <Pressable
              key={frame.id}
              onPress={() => handleSelect(frame.value)}
              style={({ pressed }) => [
                styles.tab,
                isSelected && styles.tabActive,
                pressed && styles.tabPressed,
              ]}
            >
              <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                {frame.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 16,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }),
  },
  tabActive: {
    backgroundColor: '#8B9A6B',
    borderColor: '#7FA14D',
  },
  tabPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    fontFamily: 'Epilogue, sans-serif',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
})

