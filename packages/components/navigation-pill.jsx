import React from 'react'
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native'
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
    if (src.src) return { uri: src.src }
    if (src.default) return src.default
    return src
  }

  const iconSource = normalizeImageSource(icon)

  const handlePress = () => {
    if (onPress) {
      onPress()
      return
    }
    if (to) {
      router.push(to)
    }
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {iconSource ? <Image source={iconSource} style={[styles.icon, iconStyle]} /> : null}
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
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    fontFamily: 'Epilogue, sans-serif',
  },
})


