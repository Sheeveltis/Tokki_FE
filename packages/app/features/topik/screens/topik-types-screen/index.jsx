import React from 'react'
import { Platform } from 'react-native'
import { TopikTypesWeb } from './topik-types.web'

export function TopikTypesScreen({ level, onBackPress }) {
  // Bỏ qua logic mobile lúc này, ưu tiên giao diện platform (web)
  const Component = Platform.OS === 'web' ? TopikTypesWeb : TopikTypesWeb

  return <Component level={level} onBackPress={onBackPress} />
}
