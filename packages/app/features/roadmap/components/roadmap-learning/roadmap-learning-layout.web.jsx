import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapLearningTabs } from './roadmap-learning-tabs'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'

const getTopikPhaseByLevel = (level) => {
  if (level === 1 || level === 2) return 'TOPIK I'
  if (level >= 3 && level <= 6) return 'TOPIK II'
  return 'TOPIK I'
}

export function RoadmapLearningLayout({ level = 1 }) {
  const [activeTab, setActiveTab] = useState('listening')

  const hasWriting = useMemo(() => level >= 3, [level])
  const phaseLabel = useMemo(() => getTopikPhaseByLevel(level), [level])

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <Text style={styles.title}>Lộ trình {phaseLabel} - Level {level}</Text>
          <Text style={styles.subtitle}>Phần nghe / đọc / viết theo ngày</Text>
        </View>

        <View style={styles.tabsRow}>
          <RoadmapLearningTabs
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            showWriting={hasWriting}
          />
        </View>

        <View style={styles.listWrapper}>
          <RoadmapLearningDayList activeTab={activeTab} hasWriting={hasWriting} level={level} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: '#FFD7D0',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  contentWrapper: {
    width: '70%',
    maxWidth: '100%',
    minHeight: '90vh',
    alignItems: 'stretch',
    backgroundColor: '#FDF7EC',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 40,
    borderRadius: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  subtitle: {
    fontSize: 15,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
  },
  tabsRow: {
    marginTop: 8,
  },
  listWrapper: {
    flex: 1,
    marginTop: 8,
  },
})

