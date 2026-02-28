import React, { useMemo, useState } from 'react'
import { StyleSheet, Text, View, Pressable } from 'react-native'
import { Navbar } from '../../../../../components/navbar'
import { RoadmapLearningTabs } from './roadmap-learning-tabs'
import { RoadmapLearningDayList } from './roadmap-learning-day-list'
import { RoadmapExamHistoryModal } from './roadmap-exam-history-modal.web'

const getTopikPhaseByLevel = (level) => {
  if (level === 1 || level === 2) return 'TOPIK I'
  if (level >= 3 && level <= 6) return 'TOPIK II'
  return 'TOPIK I'
}

export function RoadmapLearningLayout({ level = 1 }) {
  const [activeTab, setActiveTab] = useState('listening')
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false)

  const hasWriting = useMemo(() => level >= 3, [level])
  const phaseLabel = useMemo(() => getTopikPhaseByLevel(level), [level])

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerText}>
              <Text style={styles.title}>Lộ trình {phaseLabel} - Level {level}</Text>
              <Text style={styles.subtitle}>Phần nghe / đọc / viết theo ngày</Text>
            </View>
            <Pressable
              onPress={() => setIsHistoryModalVisible(true)}
              style={({ pressed }) => [
                styles.historyButton,
                pressed && styles.historyButtonPressed,
              ]}
            >
              <Text style={styles.historyButtonText}>Lịch sử làm bài</Text>
            </Pressable>
          </View>
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

      <RoadmapExamHistoryModal
        visible={isHistoryModalVisible}
        onClose={() => setIsHistoryModalVisible(false)}
      />
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  headerText: {
    flex: 1,
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
  historyButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  historyButtonPressed: {
    backgroundColor: '#FF5252',
    transform: [{ scale: 0.95 }],
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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

