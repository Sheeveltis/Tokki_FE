import { useEffect, useRef, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import { normalizeImageSource } from '../../../../study/api'

import CarrotGround from '../../../../../../assets/carrot-ground.png'
import MatchingCardResultContent from './matching-card-result-content'
import { MatchingCardLeaderboardPopup } from './matching-card-leaderboard-popup'
import { saveGameResult, updateGameResult, mapLevelToDifficulty } from '../../../api/matching-card-play-api'
import { awardMinigameXP } from '../../../api/api'

/**
 * Web layout cho màn kết quả Matching Card
 *
 * @param {{
 *  gameId?: string
 *  topicId?: string
 *  topicName?: string
 *  levelId?: string
 *  score?: number
 *  topPercent?: number
 *  timeLeft?: number
 *  hasPlayed?: boolean
 *  onReplay?: () => void
 *  onBack?: () => void
 * }} props
 */
export function MatchingCardResultLayout({
  gameId = '',
  topicId = 'life',
  levelId = 'medium',
  score = 0,
  topPercent = 5,
  timeLeft = 0,
  hasPlayed = false,
  onReplay,
}) {
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const awardedXPRef = useRef(false)

  // Save game result when component mounts
  useEffect(() => {
    const saveResult = async () => {
      // Debug: Log tất cả params
      console.log('[MatchingCardResultLayout] Save result params:', {
        gameId,
        topicId,
        levelId,
        score,
        hasPlayed,
      })

      // Chỉ lưu nếu có đủ thông tin
      // topicId === 'life' là giá trị mặc định, không phải topicId thực tế
      if (!gameId) {
        console.warn('[MatchingCardResultLayout] Missing gameId, skipping save', {
          gameId,
          topicId,
        })
        return
      }
      
      if (!topicId || topicId === 'life') {
        console.warn('[MatchingCardResultLayout] Missing or invalid topicId, skipping save', {
          gameId,
          topicId,
        })
        return
      }

      try {
        const gameDifficulty = mapLevelToDifficulty(levelId)

        if (hasPlayed) {
          // User đã chơi rồi → dùng PUT để cập nhật
          console.log('[MatchingCardResultLayout] 🔄 Updating game result (PUT)...', {
            gameId,
            topicId,
            score,
            gameDifficulty,
          })
          const response = await updateGameResult(gameId, topicId, score, gameDifficulty)
          console.log('[MatchingCardResultLayout] PUT API response:', response)
          if (response?.isSuccess) {
            console.log('[MatchingCardResultLayout] ✅ Game result updated successfully')
          } else {
            console.error('[MatchingCardResultLayout] ❌ Failed to update game result:', response?.message || 'Unknown error')
          }
        } else {
          // User chưa chơi → dùng POST để tạo mới
          console.log('[MatchingCardResultLayout] ➕ Saving new game result (POST)...', {
            gameId,
            topicId,
            score,
            gameDifficulty,
          })
          const response = await saveGameResult(gameId, topicId, score, gameDifficulty)
          console.log('[MatchingCardResultLayout] POST API response:', response)
          if (response?.isSuccess) {
            console.log('[MatchingCardResultLayout] ✅ Game result saved successfully')
          } else {
            console.error('[MatchingCardResultLayout] ❌ Failed to save game result:', response?.message || 'Unknown error')
          }
        }
      } catch (error) {
        console.error('[MatchingCardResultLayout] Error saving game result:', error)
      }

      if (!awardedXPRef.current) {
        try {
          await awardMinigameXP(levelId)
          awardedXPRef.current = true
          console.log('[MatchingCardResultLayout] ✅ Awarded XP for matching-card')
        } catch (xpError) {
          console.error('[MatchingCardResultLayout] ⚠️ Failed awarding XP:', xpError)
        }
      }
    }

    saveResult()
  }, [gameId, topicId, levelId, score, hasPlayed])
  return (
    <View style={styles.page}>
      

      <View style={styles.contentWrapper}>
        <MatchingCardResultContent
          score={score}
          topPercent={topPercent}
          timeLeft={timeLeft}
          onReplay={onReplay}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
      </View>

      <Image
        source={normalizeImageSource(CarrotGround)}
        style={styles.carrotGround}
        resizeMode="cover"
      />

      <MatchingCardLeaderboardPopup
        visible={showLeaderboard}
        gameId={gameId}
        topicId={topicId}
        gameDifficulty={mapLevelToDifficulty(levelId)}
        onClose={() => setShowLeaderboard(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#F3EEDC',
  },
  contentWrapper: {
    flex: 0.5,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carrotGround: {
    width: '100%',
    height: 179,
  },
})

export default MatchingCardResultLayout
