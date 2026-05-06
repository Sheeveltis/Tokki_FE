import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native'
import { getProgress } from '../../../api/profile'

export function ExpInfo({ label = 'Kinh nghiệm', progress }) {
  const [loading, setLoading] = useState(!progress)
  const [progressData, setProgressData] = useState(progress || null)

  useEffect(() => {
    if (progress) {
      setProgressData(progress)
      setLoading(false)
      return
    }

    const fetchProgress = async () => {
      try {
        setLoading(true)
        const data = await getProgress()
        setProgressData(data)
      } catch (error) {
        console.error('[UserExp] Lỗi khi lấy thông tin progress:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [progress])

  const progressWidth = progressData?.progressPercentage !== undefined
    ? `${progressData.progressPercentage}%`
    : '0%'

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#F1BE4B" />
      </View>
    )
  }

  if (!progressData) return null

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.labelSection}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.xpText}>Cấp {progressData.level}</Text>
        </View>
        <View style={styles.levelBadge}>
          <Text style={styles.levelValue}>{progressData.progressPercentage}%</Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.xpCurrent}>
          {progressData.xpInCurrentLevel} <Text style={styles.xpTarget}>/ {progressData.maxXPOfLevel} XP</Text>
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelSection: {
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
  },
  xpText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1BE4B',
  },
  levelBadge: {
    backgroundColor: '#FFF9F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(241, 190, 75, 0.3)',
  },
  levelValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#20130A',
  },
  progressContainer: {
    width: '100%',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F1BE4B',
    borderRadius: 5,
  },
  footer: {
    marginTop: 2,
  },
  xpCurrent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#20130A',
  },
  xpTarget: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A0A0A0',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
})
