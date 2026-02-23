import React, { useState, useEffect } from 'react'
import { useRouter } from 'solito/navigation'

import WordleRule from '../../components/wordle/wordle-rule/wordle-rule'
import { getWordleLevelByDifficulty, getWordleLevels } from '../../api/wordle-level-api'
import WordleLevelPopup from '../../components/wordle/wordle-rule/wordle-level-popup'

export function WordleRuleScreen({ basePath = '/minigame/wordle' }) {
  const router = useRouter()
  const [showLevelPopup, setShowLevelPopup] = useState(false)
  const [loadingLevel, setLoadingLevel] = useState(false)
  const [levelsData, setLevelsData] = useState([])

  const handleOpenLevelPopup = async () => {
    setShowLevelPopup(true)
    // Fetch levels data khi mở popup
    try {
      const levels = await getWordleLevels()
      setLevelsData(levels || [])
    } catch (error) {
      console.error('[WordleRuleScreen] Failed to fetch levels:', error)
      setLevelsData([])
    }
  }

  const handleSelectLevel = async (difficultyLevel) => {
    try {
      setLoadingLevel(true)
      const levelData = await getWordleLevelByDifficulty(difficultyLevel)
      if (!levelData) {
        console.error('[WordleRuleScreen] No level data for difficulty:', difficultyLevel)
        return
      }

      // Kiểm tra nếu level đã won thì không cho chọn
      if (levelData.isWon) {
        console.log('[WordleRuleScreen] Level already won, cannot select')
        return
      }

      const query = new URLSearchParams()
      query.set('level', String(difficultyLevel))
      if (levelData.dailyWordleId) query.set('dailyWordleId', String(levelData.dailyWordleId))
      if (levelData.wordLength) query.set('wordLength', String(levelData.wordLength))

      router.push(`${basePath}/wordle-play?${query.toString()}`)
    } catch (error) {
      console.error('[WordleRuleScreen] Failed to load wordle level:', error)
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
    </>
  )
}

export default WordleRuleScreen



