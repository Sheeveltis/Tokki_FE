import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View, Image, Platform } from 'react-native'

import BunnyEasy from '../../../../../../assets/bunny/1.png'
import BunnyMedium from '../../../../../../assets/bunny/9.png'
import BunnyHard from '../../../../../../assets/bunny/14.png'

const normalizeImageSource = (src) => {
  if (!src) return null
  if (typeof src === 'number' || src.uri) return src
  if (typeof src === 'object' && src.src) return { uri: src.src }
  if (typeof src === 'string') return { uri: src }
  return src
}

const DEFAULT_LEVELS = [
  { id: 'easy', title: 'Mức độ', subtitle: 'Dễ', icon: BunnyEasy, quantity: 16 },
  { id: 'medium', title: 'Mức độ', subtitle: 'Trung bình', icon: BunnyMedium, quantity: 18 },
  { id: 'hard', title: 'Mức độ', subtitle: 'Khó', icon: BunnyHard, quantity: 40 },
]

/**
 * Popup component chọn mức độ cho matching card
 */
export function MatchingCardLevelPopup({ visible, onClose, onConfirm }) {
  const [current, setCurrent] = useState('medium')

  if (!visible) return null

  const handleSelect = (id) => {
    setCurrent(id)
  }

  const handleConfirm = () => {
    const level = DEFAULT_LEVELS.find((lv) => lv.id === current)
    if (level && typeof onConfirm === 'function') {
      onConfirm({ id: level.id, quantity: level.quantity })
    }
  }

  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose()
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Chọn mức độ</Text>

        <View style={styles.list}>
          {DEFAULT_LEVELS.map((level) => {
            const active = level.id === current
            return (
              <Pressable
                key={level.id}
                style={[styles.item, active && styles.itemActive]}
                onPress={() => handleSelect(level.id)}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.iconContainer, active && styles.iconContainerActive]}>
                    <Image
                      source={normalizeImageSource(level.icon)}
                      style={styles.avatar}
                      resizeMode="contain"
                    />
                  </View>
                </View>

                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{level.title}</Text>
                  <Text style={styles.itemSubtitle}>{level.subtitle}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.buttonCancel]} onPress={handleClose}>
            <Text style={styles.buttonCancelText}>Hủy</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.buttonConfirm]} onPress={handleConfirm}>
            <Text style={styles.buttonConfirmText}>Xác nhận</Text>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(250, 250, 250, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    elevation: 20,
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }),
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Epilogue, sans-serif',
  },
  list: {
    gap: 16,
    marginBottom: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 16,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
    }),
  },
  itemActive: {
    backgroundColor: '#FEF7E6',
    borderColor: '#F1BE4B',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 12px rgba(241, 190, 75, 0.15)',
    }),
  },
  itemLeft: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconContainerActive: {
    backgroundColor: '#FFFFFF',
  },
  avatar: {
    width: 50,
    height: 50,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
  itemSubtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 20,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#F5F5F5',
  },
  buttonConfirm: {
    backgroundColor: '#F1BE4B',
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  buttonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
})

export default MatchingCardLevelPopup
