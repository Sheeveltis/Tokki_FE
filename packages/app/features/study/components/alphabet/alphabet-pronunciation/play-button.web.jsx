import React from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../../api'
import PlayIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'

/**
 * PlayButton: Nút phát âm
 */
export function PlayButton({ isPlaying, onPress }) {
  return (
    <Pressable
      style={[styles.button, isPlaying && styles.buttonActive]}
      onPress={onPress}
      disabled={isPlaying}
    >
      <Image
        source={normalizeImageSource(PlayIcon)}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.text}>
        {isPlaying ? 'Đang phát...' : 'Nghe phát âm'}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
    shadowColor: '#F1BE4B',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  buttonActive: {
    backgroundColor: '#E5A93D',
    opacity: 0.8,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#1F1F1F',
  },
  text: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

