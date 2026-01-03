import React, { useRef } from 'react'
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
  name: 'Phạm Quý',
  phone: '0368182797',
  avatar: UserIcon,
}

export function UserAvatarCard({ user = MOCK_USER, onAvatarPress }) {
  const fileInputRef = useRef(null)

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
    <View style={styles.card}>
      <Pressable onPress={handleAvatarPress} style={styles.avatarPressable}>
        <View style={styles.avatarWrap}>
          <Image source={normalizeImageSource(user.avatar)} style={styles.avatar} resizeMode="cover" />
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

      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.phone}>{user.phone}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
    minWidth: 180,
    minHeight: 180,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E3DC',
  },
  avatarPressable: {
    cursor: 'pointer',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 60,
    height: 60,
  },
  hiddenInput: {
    display: 'none',
  },
  name: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '800',
    color: '#1B1B1B',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
  phone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1B1B',
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
  },
})

