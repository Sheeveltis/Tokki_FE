import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { View, Platform } from 'react-native'
import { apiClient } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { XpNotification } from '../../../components/xp-notification'
import { UnlockedTitlesModal } from '../../features/authentication/components/login/unlocked-titles-modal'

/**
 * Nguồn cộng XP (Enum mapping từ backend)
 */
export const XpSourceList = {
  MINIGAME: 1,
  VOCABULARY: 2,
  DAILY_STREAK: 3,
  EXAM: 4,
}

/**
 * Danh sách System Config Keys liên quan đến XP
 */
export const XpConfigKeys = {
  COMPLETED_FLASHCARD_TOPIC: "COMPLETED_FLASHCARD_TOPIC",
  MINI_EXAM_TOPIK_I_REWARD: "MINI_EXAM_TOPIK_I_REWARD",
  MINI_EXAM_TOPIK_II_REWARD: "MINI_EXAM_TOPIK_II_REWARD",
  SRS_ON_TIME_REWARD: "SRS_ON_TIME_REWARD",
  DAILY_GOAL_REWARD: "DAILY_GOAL_REWARD",
  STREAK_RESET_CONDITION: "STREAK_RESET_CONDITION",
  INACTIVE_PENALTY_TITLE: "INACTIVE_PENALTY_TITLE",
  MINIGAME_WIN_LV1: "MINIGAME_WIN_LV1",
  MINIGAME_WIN_LV2: "MINIGAME_WIN_LV2",
  MINIGAME_WIN_LV3: "MINIGAME_WIN_LV3",
  MINIGAME_LOSS_LV1: "MINIGAME_LOSS_LV1",
  MINIGAME_LOSS_LV2: "MINIGAME_LOSS_LV2",
  MINIGAME_LOSS_LV3: "MINIGAME_LOSS_LV3",
  MINIGAME_BONUS_PB_LV1: "MINIGAME_BONUS_PB_LV1",
  MINIGAME_BONUS_PB_LV2: "MINIGAME_BONUS_PB_LV2",
  MINIGAME_BONUS_PB_LV3: "MINIGAME_BONUS_PB_LV3",
  MINIGAME_DAILY_LIMIT: "MINIGAME_DAILY_LIMIT",
}

const XpContext = createContext({
  addXp: async (configKey: string, source: number) => {},
  visible: false,
  xpValue: 0,
  isLevelUp: false,
  newLevel: 0,
  loading: false,
})

export const useXp = () => useContext(XpContext)

export const XpProvider = ({ children }: { children: React.ReactNode }) => {
  const [notification, setNotification] = useState({
    visible: false,
    xpValue: 0,
    isLevelUp: false,
    newLevel: 0,
    loading: false,
  })
  
  // State cho danh hiệu mới mở khóa
  const [unlockedTitles, setUnlockedTitles] = useState([])
  const [showTitlesModal, setShowTitlesModal] = useState(false)

  const timerRef = useRef<any>(null)

  /**
   * Cộng XP dựa trên config key và source
   * 1. Lấy giá trị XP từ system config
   * 2. Gọi API cộng XP
   * 3. Hiển thị thông báo
   */
  const addXp = useCallback(async (configKey: string, source: number) => {
    if (timerRef.current) clearTimeout(timerRef.current)

    try {
      // 1. Lấy giá trị cấu hình (XP amount) ngầm
      let xpAmount = 10; 
      try {
        const configRes = await apiClient.get(ENDPOINTS.SYSTEM_CONFIGS.GET_BY_KEY(configKey))
        if (configRes.data && configRes.data.isSuccess) {
          xpAmount = parseInt(configRes.data.data.value, 10)
        } else if (configRes.data && configRes.data.value) {
          xpAmount = parseInt(configRes.data.value, 10)
        }
      } catch (e) {
        // Bỏ qua lỗi ngầm
      }

      if (isNaN(xpAmount) || xpAmount <= 0) xpAmount = 10

      // 2. Gọi API cộng XP thực tế
      const res = await apiClient.post(ENDPOINTS.GAMIFICATION.ADD_XP, {
        amount: xpAmount,
        source: source,
      })

      if (res.data && res.data.isSuccess) {
        // 3. HIỂN THỊ THÔNG BÁO CHỈ KHI ĐÃ CÓ KẾT QUẢ THỰC TẾ TỪ SERVER
        setNotification({
          visible: true,
          xpValue: res.data.data.xpAdded,
          isLevelUp: res.data.data.isLevelUp,
          newLevel: res.data.data.newLevel,
          loading: false,
        })

        // Tự động ẩn sau 4.5s
        timerRef.current = setTimeout(() => {
          setNotification(prev => ({ ...prev, visible: false }))
        }, 4500)

        // 4. Kiểm tra danh hiệu cấp độ mới
        try {
          const titleRes = await apiClient.post(ENDPOINTS.TITLE.CHECK_LEVEL_TITLES)
          if (titleRes.data && titleRes.data.isSuccess && titleRes.data.data && titleRes.data.data.length > 0) {
            setUnlockedTitles(titleRes.data.data)
            setShowTitlesModal(true)
          }
        } catch (titleErr) {
          console.error('[Title Check Error]:', titleErr)
        }
      }
    } catch (err) {
      console.error('[XP Error Handling]:', err)
    }
  }, [])

  return (
    <XpContext.Provider value={{ addXp, ...notification }}>
      {children}
      <XpNotification 
        xp={notification.xpValue} 
        visible={notification.visible} 
        isLevelUp={notification.isLevelUp}
        newLevel={notification.newLevel}
        loading={notification.loading}
      />
      <UnlockedTitlesModal 
        visible={showTitlesModal} 
        titles={unlockedTitles} 
        onClose={() => setShowTitlesModal(false)} 
      />
    </XpContext.Provider>
  )
}
