import { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'

import WordleRule from './wordle-rule'
import WordleLevelPopup from './wordle-level-popup'
import { getWordleLevelByDifficulty, getWordleLevels } from '../../../api/wordle-level-api'
import { LoginRequest } from '../../../../../../components/loginRequest'
import { getAuthToken, getAuthTokenAsync, isCurrentTokenExpired, isCurrentTokenExpiredAsync } from '../../../../../provider/api/client'
import { Platform } from 'react-native'

export function WordleRuleLayoutNative() {
  const navigation = useNavigation()
  const [showLevelPopup, setShowLevelPopup] = useState(false)
  const [loadingLevel, setLoadingLevel] = useState(false)
  const [levelsData, setLevelsData] = useState([])
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleOpenLevelPopup = async () => {
    const token = await getAuthTokenAsync()
    const isAuthed = Platform.OS === 'web'
      ? (Boolean(token) && !(await isCurrentTokenExpiredAsync()))
      : Boolean(token)

    if (!isAuthed) {
      setShowLoginRequest(true)
      return
    }

    setShowLevelPopup(true)

    try {
      const levels = await getWordleLevels()
      setLevelsData(levels || [])
    } catch (error) {
      console.error('[WordleRuleLayoutNative] Failed to fetch levels:', error)
      setLevelsData([])
    }
  }

  const handleSelectLevel = async (difficultyLevel) => {
    try {
      setLoadingLevel(true)
      const levelData = await getWordleLevelByDifficulty(difficultyLevel)

      if (!levelData) {
        console.error('[WordleRuleLayoutNative] No level data for difficulty:', difficultyLevel)
        return
      }

      if (levelData.isWon) {
        console.log('[WordleRuleLayoutNative] Level already completed, cannot select')
        return
      }

      const params = {
        level: String(difficultyLevel),
      }
      if (levelData.dailyWordleId) params.dailyWordleId = String(levelData.dailyWordleId)
      if (levelData.wordLength) params.wordLength = String(levelData.wordLength)
      if (Number.isFinite(levelData.attemptCount)) params.attemptCount = String(levelData.attemptCount)
      if (Number.isFinite(levelData.maxAttempts) && levelData.maxAttempts > 0) {
        params.maxAttempts = String(levelData.maxAttempts)
      }

      navigation.navigate('wordle-play', params)
    } catch (error) {
      console.error('[WordleRuleLayoutNative] Failed to load wordle level:', error)
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

export default WordleRuleLayoutNative
