import React from 'react'
import { View, Image as RNImage, StyleSheet } from 'react-native'
import { normalizeImageSource } from '../api'

/**
 * StudyIcon: Component hiển thị icon hỗ trợ cả PNG/JPG và SVG (Component)
 */
export function StudyIcon({ source, style, tintColor, width = 20, height = 20 }) {
  if (!source) return null

  // Kiểm tra xem source có phải là React component không (SVG component)
  const isReactComponent = 
    typeof source === 'function' || 
    (typeof source === 'object' && source.$$typeof) ||
    (typeof source === 'object' && source.default && (typeof source.default === 'function' || source.default.$$typeof))

  if (isReactComponent) {
    const IconComponent = typeof source === 'function' ? source : (source.default || source)
    return (
      <View style={[styles.iconContainer, { width, height, color: tintColor }, style]}>
        <IconComponent width={width} height={height} fill="currentColor" />
      </View>
    )
  }

  const imageSource = normalizeImageSource(source)
  return (
    <RNImage 
      source={imageSource} 
      style={[{ width, height }, tintColor ? { tintColor } : {}, style]} 
      resizeMode="contain" 
    />
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
