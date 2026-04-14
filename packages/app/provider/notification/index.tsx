import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNotificationSignalR } from '../../features/general/api/use-notification-signalr'
import { getAuthToken, apiClient } from '../api/client'
import { ENDPOINTS } from '../api/endpoints'
import { Platform } from 'react-native'

export enum NotificationType {
  System = 0,
  BlogApproval = 1,
  BlogComment = 2,
  ExamResult = 3,
  VipActivation = 4,
  LevelUp = 5,
  ModerationWarning = 6
}

export enum NotificationReadFilter {
  All = 0,
  Read = 1,
  Unread = 2
}

interface NotificationContextType {
  unreadCount: number
  notifications: any[]
  setUnreadCount: (count: number) => void
  addNotification: (notification: any) => void
  clearUnreadCount: () => void
  fetchNotifications: (filter?: number) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAllAsRead: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: () => {},
  addNotification: () => {},
  clearUnreadCount: () => {},
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(getAuthToken())

  const fetchNotifications = useCallback(async (filter: number = 0) => {
    if (!getAuthToken()) return;
    try {
      const response = await apiClient.get(ENDPOINTS.NOTIFICATION.MY_NOTIFICATIONS(1, 20, filter))
      if (response.data?.isSuccess) {
        // Handle new nested structure: data.notifications.items
        const notiData = response.data.data.notifications;
        const items = notiData?.items || [];
        setNotifications(items)
        
        // Use totalUnreadCount from backend
        setUnreadCount(response.data.data.totalUnreadCount || 0)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }, [])

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await apiClient.patch(ENDPOINTS.NOTIFICATION.MARK_AS_READ(id))
      if (response.data?.isSuccess) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await apiClient.patch(ENDPOINTS.NOTIFICATION.MARK_ALL_AS_READ)
      if (response.data?.isSuccess) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [])

  useEffect(() => {
    const updateToken = () => {
      const newToken = getAuthToken()
      setToken(newToken)
      if (newToken) {
        fetchNotifications()
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    }

    updateToken()

    if (Platform.OS === 'web') {
      window.addEventListener('token-changed', updateToken)
      return () => window.removeEventListener('token-changed', updateToken)
    }
  }, [fetchNotifications])

  const handleNotificationReceived = useCallback((notification: any, count: number) => {
    console.log('🔔 [Notification Received]:', notification)
    console.log('🔢 [Unread Count]:', count)
    
    setUnreadCount(count)
    setNotifications(prev => [notification, ...prev].slice(0, 50)) // Keep last 50
  }, [])


  useNotificationSignalR(token, handleNotificationReceived)

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0)
  }, [])

  const addNotification = useCallback((notification: any) => {
    setNotifications(prev => [notification, ...prev])
  }, [])

  return (
    <NotificationContext.Provider 
      value={{ 
        unreadCount, 
        notifications, 
        setUnreadCount, 
        addNotification,
        clearUnreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
