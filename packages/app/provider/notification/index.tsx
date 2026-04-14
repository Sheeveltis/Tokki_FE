import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNotificationSignalR } from '../../features/general/api/use-notification-signalr'
import { getAuthToken } from '../api/client'
import { Platform } from 'react-native'

interface NotificationContextType {
  unreadCount: number
  notifications: any[]
  setUnreadCount: (count: number) => void
  addNotification: (notification: any) => void
  clearUnreadCount: () => void
}

const NotificationContext = createContext<NotificationContextType>({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: () => {},
  addNotification: () => {},
  clearUnreadCount: () => {},
})

export const useNotifications = () => useContext(NotificationContext)

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<any[]>([])
  const [token, setToken] = useState<string | null>(getAuthToken())

  useEffect(() => {
    const updateToken = () => {
      setToken(getAuthToken())
    }

    if (Platform.OS === 'web') {
      window.addEventListener('token-changed', updateToken)
      return () => window.removeEventListener('token-changed', updateToken)
    }
  }, [])

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
        clearUnreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
