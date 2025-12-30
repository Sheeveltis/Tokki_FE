'use client'
import React, { useMemo } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { AppRegistry, StyleSheet } from 'react-native'

/**
 * Inject CSS react-native-web ngay từ SSR:
 * - Đăng ký app RNW một lần (ổn định)
 * - Ưu tiên AppRegistry.getApplication().getStyleElement()
 * - Fallback StyleSheet.getSheet() nếu cần
 */
export function StylesProvider({ children }: { children: React.ReactNode }) {
  // Đăng ký một lần, tránh churn registry giữa các render
  useMemo(() => {
    AppRegistry.registerComponent('Main', () => () => children)
    return undefined
  }, [])

  useServerInsertedHTML(() => {
    // @ts-expect-error getApplication có trên RNW
    const app = AppRegistry.getApplication?.('Main')
    const getStyleElement = app?.getStyleElement
    if (typeof getStyleElement === 'function') {
      return getStyleElement()
    }

    // Fallback: lấy sheet thủ công
    // @ts-expect-error getSheet không có type chính thức
    const sheet = StyleSheet.getSheet?.()
    if (sheet?.textContent) {
      return <style id={sheet.id} dangerouslySetInnerHTML={{ __html: sheet.textContent }} />
    }

    return null
  })

  return <>{children}</>
}

