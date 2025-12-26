import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View, Image, Platform } from 'react-native'

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
  { id: 'easy', title: 'Mức độ', subtitle: 'Dễ', icon: BunnyEasy, quantity: 5 },
  { id: 'medium', title: 'Mức độ', subtitle: 'Trung bình', icon: BunnyMedium, quantity: 10 },
  { id: 'hard', title: 'Mức độ', subtitle: 'Khó', icon: BunnyHard, quantity: 18 },
]

/**
 * Popup component chọn mức độ cho matching card
 *
 * @param {{
 *  visible: boolean
 *  onClose?: () => void
 *  onConfirm?: (level: { id: string, quantity: number }) => void
 * }} props
 */
export function MatchingCardLevelPopup({ visible, onClose, onConfirm }) {
  const [current, setCurrent] = useState('medium')

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
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
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
                    <Image
                      source={normalizeImageSource(level.icon)}
                      style={styles.avatar}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.itemDivider} />

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
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#F7F0DD',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 24px rgba(0,0,0,0.25)' }),
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 24,
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
    backgroundColor: '#FFEEC2',
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#F5D27A',
  },
  itemActive: {
    backgroundColor: '#F39F2D',
    borderColor: '#C06C00',
  },
  itemLeft: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
  },
  itemDivider: {
    width: 2,
    height: 60,
    backgroundColor: '#F1BE4B',
    marginHorizontal: 14,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1C',
  },
  itemSubtitle: {
    fontSize: 16,
    color: '#1C1C1C',
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
    backgroundColor: '#CCCCCC',
  },
  buttonConfirm: {
    backgroundColor: '#7FA14D',
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  buttonConfirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
})

