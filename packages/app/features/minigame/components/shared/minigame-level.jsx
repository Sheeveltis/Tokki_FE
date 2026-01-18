import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View, Image, Platform } from 'react-native'
import { normalizeImageSource } from '../../../study/api'

import BunnyEasy from '../../../../../assets/bunny/1.png'
import BunnyMedium from '../../../../../assets/bunny/9.png'
import BunnyHard from '../../../../../assets/bunny/14.png'

const DEFAULT_LEVELS = [
  { id: 'easy', title: 'Mức độ', subtitle: 'Dễ', icon: BunnyEasy },
  { id: 'medium', title: 'Mức độ', subtitle: 'Trung bình', icon: BunnyMedium },
  { id: 'hard', title: 'Mức độ', subtitle: 'Khó', icon: BunnyHard },
]

/**
 * Popup chọn mức độ minigame
 *
 * @param {{
 *  visible: boolean
 *  levels?: Array<{ id: string, title: string, subtitle: string, icon: any }>
 *  selectedId?: string
 *  onSelect?: (id: string) => void
 *  onConfirm?: (level: any) => void
 *  onClose?: () => void
 * }} props
 */
export function MinigameLevel({ visible, levels = DEFAULT_LEVELS, selectedId, onSelect, onConfirm, onClose }) {
  const [current, setCurrent] = useState(selectedId || levels?.[1]?.id || levels?.[0]?.id)

  const handleSelect = (id) => {
    setCurrent(id)
    if (typeof onSelect === 'function') onSelect(id)
  }

  const handleConfirm = () => {
    const level = levels.find((lv) => lv.id === current)
    if (typeof onConfirm === 'function') onConfirm(level || { id: current })
    if (typeof onClose === 'function') onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.title}>Mức độ</Text>

          <View style={styles.list}>
            {levels.map((level) => {
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

          <Pressable onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>Xác nhận</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#F5F0DD',
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' }),
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 20,
  },
  list: {
    gap: 18,
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
    shadowColor: '#E9C46A',
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 6 },
  },
  itemActive: {
    backgroundColor: '#F39F2D',
    borderColor: '#C06C00',
    shadowColor: '#00000055',
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
  confirmButton: {
    alignSelf: 'center',
    backgroundColor: '#7FA14D',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 24,
    minWidth: 200,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})


