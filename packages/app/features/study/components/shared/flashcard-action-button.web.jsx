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
      {icon && (
        <View style={styles.left}>
          <Image
            source={normalizeImageSource(icon)}
            style={styles.icon}
            resizeMode="contain"
          />
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#F1BE4B',
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'opacity, background-color',
      transitionDuration: '150ms',
    }),
  },
  buttonActive: {
    opacity: 0.85,
  },
  left: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#1F1F1F',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
})

