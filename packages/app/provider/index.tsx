import { useEffect } from 'react'
import { Platform } from 'react-native'
import { SafeArea } from 'app/provider/safe-area'
import { NavigationProvider } from './navigation'

// Import expo-navigation-bar cho Android
let setBackgroundColorAsync: ((color: string) => Promise<void>) | null = null
let setButtonStyleAsync: ((style: 'light' | 'dark' | 'auto') => Promise<void>) | null = null

if (Platform.OS === 'android') {
  try {
    const NavigationBar = require('expo-navigation-bar')
    setBackgroundColorAsync = NavigationBar.setBackgroundColorAsync
    setButtonStyleAsync = NavigationBar.setButtonStyleAsync
  } catch (e) {
    // expo-navigation-bar không có sẵn, bỏ qua
    console.log('expo-navigation-bar not available')
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  // Set navigation bar color thành đen khi app load
  useEffect(() => {
    if (Platform.OS === 'android') {
      if (setBackgroundColorAsync) {
        setBackgroundColorAsync('#000000').catch(() => {}) // Màu đen
      }
      if (setButtonStyleAsync) {
        setButtonStyleAsync('light').catch(() => {}) // Nút sáng (trắng) trên nền đen
      }
    }
  }, [])

  return (
    <SafeArea>
      <NavigationProvider>{children}</NavigationProvider>
    </SafeArea>
  )
}
