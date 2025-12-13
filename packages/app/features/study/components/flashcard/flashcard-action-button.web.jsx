import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../api'

/**
 * FlashcardActionButton: Nút hành động cho trang học flashcard (Học/Kiểm tra)
 */
export function FlashcardActionButton({
  icon,
  title,
  onPress,
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === 'web' && setHovered(true)}
      onHoverOut={() => Platform.OS === 'web' && setHovered(false)}
      style={({ pressed }) => [
        styles.button,
        (pressed || hovered) && styles.buttonActive,
      ]}
    >
      <View style={styles.left}>
        <Image
          source={normalizeImageSource(icon)}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.divider} />
      <View style={styles.middle}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 50,
    backgroundColor: '#F1BE4B',
    borderRadius: 100,
    shadowColor: '#F1BE4B',
    shadowOpacity: 1,
    shadowRadius: 1,
    shadowOffset: { width: 0, height: 6 },
    ...(Platform.OS === 'web' && {
      transitionProperty: 'transform, box-shadow, background-color',
      transitionDuration: '150ms',
      cursor: 'pointer',
    }),
  },
  buttonActive: {
    transform: [{ translateY: -2 }],
    shadowOpacity: 0.22,
    backgroundColor: '#E5A93D',
  },
  left: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 48,
    height: 48,
  },
  divider: {
    width: 2,
    height: 50,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    opacity: 0.3,
  },
  middle: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

