import { useCallback, useState } from 'react'
import { Platform } from 'react-native'
import { useRouter, useSearchParams } from 'solito/navigation'

import MatchingCardBannerImage from '../../../../assets/Matching-Card-Banner.png'
import BannerImage from '../../../../assets/Solitaire-banner-outside.png'
import WordleBannerImage from '../../../../assets/Wordle-banner.png'
import { getAuthToken, getAuthTokenAsync, isCurrentTokenExpired, isCurrentTokenExpiredAsync } from '../../../provider/api/client'
import { getWordleLevelByDifficulty, getWordleLevels } from '../api/wordle-level-api'
import { hasPlayedLevel, mapLevelToDifficulty } from '../api/matching-card-play-api'

export function useMinigameGames(options = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelFromSearch = searchParams?.get('level') || ''
  const levelId = options.levelId ?? levelFromSearch
  const onNavigate = options.onNavigate

  const [games, setGames] = useState([
    {
      gameId: '1',
      gameName: 'Matching Card',
      gameType: 1,
      isVip: false,
      imgUrl: MatchingCardBannerImage,
      description: 'Lật các thẻ bài để tìm cặp từ vựng tương ứng.',
    },
    {
      gameId: '2',
      gameName: 'Solitaire',
      gameType: 2,
      isVip: false,
      imgUrl: BannerImage,
      description: 'Xếp các quân bài theo chủ đề để giành chiến thắng.',
    },
    {
      gameId: '3',
      gameName: 'Wordle',
      gameType: 3,
      isVip: false,
      imgUrl: WordleBannerImage,
      description: 'Đoán từ vựng bí ẩn với lượt thử giới hạn mỗi ngày.',
    },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [showWordleLevelPopup, setShowWordleLevelPopup] = useState(false)
  const [loadingWordleLevel, setLoadingWordleLevel] = useState(false)
  const [wordleLevelsData, setWordleLevelsData] = useState([])
  const [showSolitareLevelPopup, setShowSolitareLevelPopup] = useState(false)
  const [showMatchingCardTopicPopup, setShowMatchingCardTopicPopup] = useState(false)
  const [showMatchingCardLevelPopup, setShowMatchingCardLevelPopup] = useState(false)
  const [selectedMatchingCardTopic, setSelectedMatchingCardTopic] = useState(null)
  const [showLoginRequest, setShowLoginRequest] = useState(false)

  const handleOpenMatchingCardTopicPopup = useCallback(async () => {
    const token = await getAuthTokenAsync()
    // Trên mobile, chỉ cần có token là cho phép thử vào, server sẽ check hết hạn sau
    const isAuthed = Platform.OS === 'web' 
      ? (Boolean(token) && !(await isCurrentTokenExpiredAsync()))
      : Boolean(token)

    if (!isAuthed) {
      setShowLoginRequest(true)
      return
    }

    setShowMatchingCardTopicPopup(true)
  }, [])

  const handleSelectMatchingCardTopic = useCallback((topic) => {
    setSelectedMatchingCardTopic(topic)
    setShowMatchingCardTopicPopup(false)
    setShowMatchingCardLevelPopup(true)
  }, [])

  const handleSelectMatchingCardLevel = useCallback(
    async (level) => {
      setShowMatchingCardLevelPopup(false)

      const topicId = selectedMatchingCardTopic?.id
      const topicName = selectedMatchingCardTopic?.titleKo
      const levelIdValue = level?.id || 'medium'
      const quantity = level?.quantity || 10
      const gameId = 'GAME001' // Matching Card ID

      const gameDifficulty = mapLevelToDifficulty(levelIdValue)

      let hasPlayed = false
      if (topicId) {
        try {
          hasPlayed = await hasPlayedLevel(gameId, topicId, gameDifficulty)
        } catch (error) {
          console.error('[useMinigameGames] Error checking hasPlayedLevel:', error)
          hasPlayed = false
        }
      }

      const params = {
        gameId,
        topic: topicId,
        topicName: topicName,
        level: levelIdValue,
        quantity: String(quantity),
        hasPlayed: String(hasPlayed),
      }

      if (onNavigate) {
        onNavigate('matching-card-play', params)
      } else {
        const query = new URLSearchParams()
        Object.keys(params).forEach((key) => query.set(key, params[key]))
        router.push(`/minigame/matching-card/matching-card-play?${query.toString()}`)
      }
    },
    [onNavigate, router, selectedMatchingCardTopic]
  )

  const handleOpenSolitareLevelPopup = useCallback(async () => {
    const token = await getAuthTokenAsync()
    const isAuthed = Platform.OS === 'web'
      ? (Boolean(token) && !(await isCurrentTokenExpiredAsync()))
      : Boolean(token)

    if (!isAuthed) {
      setShowLoginRequest(true)
      return
    }

    setShowSolitareLevelPopup(true)
  }, [])

  const handleSelectSolitareLevel = useCallback(
    (level) => {
      const params = { level }
      if (onNavigate) {
        onNavigate('solitare-play', params)
      } else {
        router.push(`/minigame/solitare/solitare-play?level=${level}`)
      }
      setShowSolitareLevelPopup(false)
    },
    [onNavigate, router]
  )

  const handleOpenWordleLevelPopup = useCallback(async () => {
    const token = await getAuthTokenAsync()
    const isAuthed = Platform.OS === 'web'
      ? (Boolean(token) && !(await isCurrentTokenExpiredAsync()))
      : Boolean(token)

    if (!isAuthed) {
      setShowLoginRequest(true)
      return
    }

    setShowWordleLevelPopup(true)

    try {
      const levels = await getWordleLevels()
      setWordleLevelsData(levels || [])
    } catch (error) {
      console.error('[useMinigameGames] Failed to fetch levels:', error)
      setWordleLevelsData([])
    }
  }, [])

  const handleSelectWordleLevel = useCallback(
    async (difficultyLevel) => {
      try {
        setLoadingWordleLevel(true)
        const levelData = await getWordleLevelByDifficulty(difficultyLevel)
        if (!levelData) {
          console.error('[useMinigameGames] No level data for difficulty:', difficultyLevel)
          return
        }

        if (levelData.isWon) {
          console.log('[useMinigameGames] Level already completed, cannot select')
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

        if (onNavigate) {
          onNavigate('wordle-play', params)
        } else {
          const query = new URLSearchParams()
          Object.keys(params).forEach((key) => query.set(key, params[key]))
          router.push(`/minigame/wordle/wordle-play?${query.toString()}`)
        }
      } catch (error) {
        console.error('[useMinigameGames] Failed to load wordle level:', error)
      } finally {
        setLoadingWordleLevel(false)
        setShowWordleLevelPopup(false)
      }
    },
    [onNavigate, router]
  )

  const pushRuleRoute = useCallback(
    (route, gameId, screenName) => {
      const params = {}
      if (levelId) params.level = String(levelId)
      if (gameId) params.gameId = String(gameId)

      if (onNavigate && screenName) {
        onNavigate(screenName, params)
        return
      }

      const query = new URLSearchParams()
      if (params.level) query.set('level', params.level)
      if (params.gameId) query.set('gameId', params.gameId)
      const url = query.toString().length > 0 ? `${route}?${query.toString()}` : route
      router.push(url)
    },
    [levelId, onNavigate, router]
  )

  const handleGamePress = useCallback(
    (game) => {
      // Native: hiện tại chỉ mở Wordle rule
      if (onNavigate) {
        if (game.gameType === 1) {
          handleOpenMatchingCardTopicPopup()
        } else if (game.gameType === 2) {
          handleOpenSolitareLevelPopup()
        } else if (game.gameType === 3) {
          handleOpenWordleLevelPopup()
        }
        return
      }

      // Web: giữ behavior cũ cho tất cả minigame
      if (game.gameType === 1) {
        handleOpenMatchingCardTopicPopup()
      } else if (game.gameType === 2) {
        handleOpenSolitareLevelPopup()
      } else if (game.gameType === 3) {
        handleOpenWordleLevelPopup()
      }
    },
    [handleOpenSolitareLevelPopup, handleOpenWordleLevelPopup, handleOpenMatchingCardTopicPopup, onNavigate]
  )

  return {
    levelId,
    games,
    loading,
    error,
    handleGamePress,
    showWordleLevelPopup,
    setShowWordleLevelPopup,
    loadingWordleLevel,
    wordleLevelsData,
    showLoginRequest,
    setShowLoginRequest,
    handleSelectWordleLevel,
    showSolitareLevelPopup,
    setShowSolitareLevelPopup,
    handleSelectSolitareLevel,
    showMatchingCardTopicPopup,
    setShowMatchingCardTopicPopup,
    showMatchingCardLevelPopup,
    setShowMatchingCardLevelPopup,
    handleSelectMatchingCardTopic,
    handleSelectMatchingCardLevel,
  }
}

export default useMinigameGames
