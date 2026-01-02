'use client'

import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Navbar } from '../../../../components/navbar'
import { LeaderboardDashboard } from './leaderBoard-dashboard'
import { Leaderboard } from './leaderBoard'

/**
 * Layout component cho leaderboard page
 */
export function LeaderboardLayoutWeb() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState(0)

  return (
    <View style={styles.wrapper}>
      <Navbar />
      <View style={styles.container}>
        <LeaderboardDashboard
          selectedTimeFrame={selectedTimeFrame}
          onTimeFrameChange={setSelectedTimeFrame}
        />
        <Leaderboard timeFrame={selectedTimeFrame} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#FFD7D0',
  },
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    padding: 20,
    paddingTop: 80, // Space for navbar
  },
})

