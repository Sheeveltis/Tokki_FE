import React, { useRef, useState } from 'react'
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { CameraFilled } from '@ant-design/icons'

import UserIcon from '../../../../../../assets/user.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const MOCK_USER = {
  avatar: UserIcon,
}

export function UserAvatarCard({ user = MOCK_USER, onAvatarPress, style }) {
  const fileInputRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleAvatarPress = () => {
    if (!onAvatarPress) return

    if (Platform.OS === 'web') {
      // Trigger file input click
      if (fileInputRef.current) {
        fileInputRef.current.click()
      }
    } else {
      // For native, call the handler directly (you might need to implement image picker)
      onAvatarPress()
    }
  }

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      if (onAvatarPress && file) {
        onAvatarPress(file)
      }
      // Reset input để có thể chọn lại cùng file
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.cardTitle}>Ảnh đại diện</Text>
      <Pressable
        onPress={handleAvatarPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={styles.avatarPressable}
      >
        <View style={styles.avatarWrap}>
          <Image source={normalizeImageSource(user.avatar)} style={styles.avatar} resizeMode="cover" />

          <View style={[styles.hoverOverlay, isHovered && styles.hoverOverlayVisible]}>
            {Platform.OS === 'web' ? (
              <CameraFilled style={{ fontSize: 24, color: '#FFFFFF' }} />
            ) : (
              <Text style={styles.editIcon}>📷</Text>
            )}
            <Text style={styles.editText}>Thay đổi</Text>
          </View>

          {Platform.OS === 'web' &&
            React.createElement('input', {
              ref: fileInputRef,
              type: 'file',
              accept: 'image/*',
              style: styles.hiddenInput,
              onChange: handleFileChange,
            })}
        </View>
      </Pressable>
      <Text style={styles.hintText}>Hỗ trợ JPG, PNG hoặc GIF. Tối đa 5MB.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Platform.OS === 'web' ? '#FFFFFF' : 'transparent',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    gap: 20,
    height: '100%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#20130A',
    fontFamily: 'Epilogue, sans-serif',
    alignSelf: 'flex-start',
  },
  avatarPressable: {
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  avatarWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F9F9F9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFF9F0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    gap: 4,
  },
  hoverOverlayVisible: {
    opacity: 1,
  },
  editIcon: {
    fontSize: 24,
  },
  editText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Epilogue, sans-serif',
  },
  hintText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 18,
  },
  hiddenInput: {
    display: 'none',
  },
})

