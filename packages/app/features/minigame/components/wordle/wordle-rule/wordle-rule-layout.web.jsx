import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useRouter } from 'solito/navigation'

import WordleRule from './wordle-rule'
import WordleLevelPopup from './wordle-level-popup'
import { getWordleLevelByDifficulty, getWordleLevels } from '../../../api/wordle-level-api'
import { LoginRequest } from '../../../../../../components/loginRequest'
import { getAuthToken, isCurrentTokenExpired } from '../../../../../provider/api/client'

export function WordleRuleLayoutWeb({ basePath = '/minigame/wordle' }) {
  const router = useRouter()
  const [showLevelPopup, setShowLevelPopup] = useState(false)
  const [loadingLevel, setLoadingLevel] = useState(false)
  const [levelsData, setLevelsData] = useState([])
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleOpenLevelPopup = async () => {
    const token = getAuthToken()
    const isAuthed = Boolean(token) && !isCurrentTokenExpired()

    if (!isAuthed) {
      setShowLoginRequest(true)
      return
    }

    setShowLevelPopup(true)

    try {
      const levels = await getWordleLevels()
      setLevelsData(levels || [])
    } catch (error) {
      console.error('[WordleRuleLayoutWeb] Failed to fetch levels:', error)
      setLevelsData([])
    }
  }

  const handleSelectLevel = async (difficultyLevel) => {
    try {
      setLoadingLevel(true)
      const levelData = await getWordleLevelByDifficulty(difficultyLevel)
      if (!levelData) {
        console.error('[WordleRuleLayoutWeb] No level data for difficulty:', difficultyLevel)
        return
      }

      if (levelData.isWon) {
        console.log('[WordleRuleLayoutWeb] Level already completed, cannot select')
        return
      }

      const query = new URLSearchParams()
      query.set('level', String(difficultyLevel))
      if (levelData.dailyWordleId) query.set('dailyWordleId', String(levelData.dailyWordleId))
      if (levelData.wordLength) query.set('wordLength', String(levelData.wordLength))
      if (Number.isFinite(levelData.attemptCount)) query.set('attemptCount', String(levelData.attemptCount))
      if (Number.isFinite(levelData.maxAttempts) && levelData.maxAttempts > 0) {
        query.set('maxAttempts', String(levelData.maxAttempts))
      }

      router.push(`${basePath}/wordle-play?${query.toString()}`)
    } catch (error) {
      console.error('[WordleRuleLayoutWeb] Failed to load wordle level:', error)
    } finally {
      setLoadingLevel(false)
      setShowLevelPopup(false)
    }
  }

  return (
    <>
      <WordleRule onStart={handleOpenLevelPopup} />
      {showLevelPopup && (
        <WordleLevelPopup
          loading={loadingLevel}
          levelsData={levelsData}
          onClose={() => setShowLevelPopup(false)}
          onSelectLevel={handleSelectLevel}
        />
      )}
      {showLoginRequest && (
        <View style={styles.loginOverlay}>
          <LoginRequest onClose={() => setShowLoginRequest(false)} />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  loginOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 2000,
  },
})

export default WordleRuleLayoutWeb
