import React from 'react'
import { TouchableOpacity, Image, Text, StyleSheet, View, Platform } from 'react-native'
import { useRouter } from 'solito/navigation'
import DefaultHomeIcon from '../assets/icon/icon-mainflow/home.svg'

/**
 * Nút điều hướng dạng pill, hỗ trợ tuỳ chọn icon và hành động.
 *
 * @param {{
 *  label?: string
 *  to?: string
 *  icon?: any
 *  onPress?: () => void
 *  style?: any
 *  textStyle?: any
 *  iconStyle?: any
 * }} props
 */
export const NavigationPill = ({
  label = 'Trang chủ',
  to = '/homepage',
  icon = DefaultHomeIcon,
  onPress,
  style,
  textStyle,
  iconStyle,
}) => {
  const router = useRouter()

  const normalizeImageSource = (src) => {
    if (!src) return null
    if (typeof src === 'number' || typeof src === 'string') return src
    if (src.uri) return src
    if (typeof src === 'object' && src.src) {
      return { uri: src.src }
    }
    if (src.default) return src.default
    // Xử lý SVG - giống như trong study/api/index.js
    if (typeof src === 'object') {
      if (src.uri) return { uri: src.uri }
      if (src.source) return src.source
    }
    return src
  }

  const iconSource = normalizeImageSource(icon)
  
  // Kiểm tra xem icon có phải là React component không (SVG component)
  // SVG có thể được import như React component hoặc object
  const isReactComponent = icon && (
    (typeof icon === 'function') || 
    (typeof icon === 'object' && icon.$$typeof) ||
    (typeof icon === 'object' && icon.default && (typeof icon.default === 'function' || icon.default.$$typeof))
  )

  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }
    if (to) {
      router.push(to)
    }
  }

  // Render icon - hỗ trợ cả Image source và React component (SVG)
  const renderIcon = () => {
    if (!icon) return null
    
    // Ưu tiên: Thử dùng Image component trước (giống như flashcard-study)
    // normalizeImageSource sẽ xử lý SVG object và trả về source phù hợp
    if (iconSource && !isReactComponent) {
      return <Image source={iconSource} style={[styles.icon, iconStyle]} />
    }
    
    // Nếu là React component (SVG component), render trực tiếp
    if (isReactComponent) {
      const IconComponent = typeof icon === 'function' ? icon : (icon.default || icon)
      const flattenedIconStyle = StyleSheet.flatten(iconStyle)
      return (
        <View style={[styles.iconContainer, iconStyle]}>
          <IconComponent 
            width={flattenedIconStyle?.width || 20} 
            height={flattenedIconStyle?.height || 20} 
            fill={flattenedIconStyle?.tintColor || flattenedIconStyle?.color || '#111'}
          />
        </View>
      )
    }
    
    // Fallback: thử render như component
    if (typeof icon === 'function') {
      const IconComponent = icon
      const flattenedIconStyle = StyleSheet.flatten(iconStyle)
      return (
        <View style={[styles.iconContainer, iconStyle]}>
          <IconComponent 
            width={flattenedIconStyle?.width || 20} 
            height={flattenedIconStyle?.height || 20} 
            fill={flattenedIconStyle?.tintColor || flattenedIconStyle?.color || '#111'}
          />
        </View>
      )
    }
    
    // Cuối cùng: thử dùng Image với iconSource
    if (iconSource) {
      return <Image source={iconSource} style={[styles.icon, iconStyle]} />
    }
    
    return null
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {renderIcon()}
      <Text style={[styles.text, textStyle]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  icon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    fontFamily: 'Epilogue, sans-serif',
  },
})


