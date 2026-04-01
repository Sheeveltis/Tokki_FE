import React, { useRef, useState } from 'react'
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native'

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
      <Pressable
        onPress={handleAvatarPress}
        onHoverIn={() => setIsHovered(true)}
        onHoverOut={() => setIsHovered(false)}
        style={styles.avatarPressable}
      >
        <View style={styles.avatarWrap}>
          <Image source={normalizeImageSource(user.avatar)} style={styles.avatar} resizeMode="cover" />

          {isHovered && (
            <View style={styles.hoverOverlay}>
              <Text style={styles.editIcon}>✎</Text>
            </View>
          )}


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
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Platform.OS === 'web' ? '#FFFFFF' : 'transparent',
    borderRadius: 24,
    paddingVertical: Platform.OS === 'web' ? 43 : 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: Platform.OS === 'web' ? 220 : '100%',
    minHeight: Platform.OS === 'web' ? 180 : undefined,
    height: Platform.OS === 'web' ? '100%' : 'auto',
    ...(Platform.OS === 'web' ? {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 6 },
      elevation: 3,
      borderWidth: 1,
      borderColor: '#E5E3DC',
    } : {}),
  },
  avatarPressable: {
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
  },
  avatarWrap: {
    width: Platform.OS === 'web' ? 128 : 160,
    height: Platform.OS === 'web' ? 128 : 160,
    borderRadius: Platform.OS === 'web' ? 64 : 80,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...(Platform.OS === 'web' ? {} : {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    }),
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  hoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
  },
  hiddenInput: {
    display: 'none',
  },
})

