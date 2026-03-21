import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'solito/navigation'

import { getUserGames } from '../api/api'

export function useMinigameGames(options = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const levelFromSearch = searchParams?.get('level') || ''
  const levelId = options.levelId ?? levelFromSearch
  const onNavigate = options.onNavigate

  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await getUserGames(1, 10)

        if (response.isSuccess && response.data?.items) {
          setGames(response.data.items)
        } else {
          setError('Không thể tải danh sách game')
        }
      } catch (err) {
        console.error('[useMinigameGames] Error fetching games:', err)
        setError('Đã xảy ra lỗi khi tải danh sách game')
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

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
        if (game.gameType === 3) {
          pushRuleRoute('/minigame/wordle/wordle-rule', game.gameId, 'wordle-rule')
        }
        return
      }

      // Web: giữ behavior cũ cho tất cả minigame
      if (game.gameType === 1) {
        pushRuleRoute('/minigame/matching-card/matching-card-rule', game.gameId, 'matching-card-rule')
      } else if (game.gameType === 2) {
        pushRuleRoute('/minigame/solitare/solitare-rule', game.gameId, 'solitare-rule')
      } else if (game.gameType === 3) {
        pushRuleRoute('/minigame/wordle/wordle-rule', game.gameId, 'wordle-rule')
      }
    },
    [onNavigate, pushRuleRoute]
  )

  return {
    games,
    loading,
    error,
    handleGamePress,
  }
}

export default useMinigameGames
