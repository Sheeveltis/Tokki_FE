import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

const TAB_DEFS = [
  { key: 'listening', label: 'Nghe hiểu' },
  { key: 'reading', label: 'Đọc hiểu' },
  { key: 'writing', label: 'Viết' },
]

export function RoadmapLearningTabs({ activeTab, onChangeTab, showWriting }) {
  const tabs = TAB_DEFS.filter((tab) => (tab.key === 'writing' ? showWriting : true))

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChangeTab && onChangeTab(tab.key)}
            style={({ pressed }) => [
              styles.tab,
              isActive && styles.tabActive,
              pressed && !isActive && styles.tabPressed,
            ]}
          >
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 8,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#F4E5C7',
  },
  tabActive: {
    backgroundColor: '#F4A950',
  },
  tabPressed: {
    opacity: 0.85,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5C4A2B',
    fontFamily: 'Epilogue, sans-serif',
  },
  tabLabelActive: {
    color: '#1C1C1C',
  },
})

