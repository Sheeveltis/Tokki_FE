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
  { id: 'easy', title: 'Mức độ', subtitle: 'Dễ', icon: BunnyEasy },
  { id: 'medium', title: 'Mức độ', subtitle: 'Trung bình', icon: BunnyMedium },
  { id: 'hard', title: 'Mức độ', subtitle: 'Khó', icon: BunnyHard },
]

/**
 * Component chọn mức độ cho trang matching-card-level (không dùng popup)
 *
 * @param {{
 *  levels?: Array<{ id: string, title: string, subtitle: string, icon: any }>
 *  selectedId?: string
 *  onSelect?: (id: string) => void
 *  onConfirm?: (level: any) => void
 * }} props
 */
export function MatchingCardLevel({ levels = DEFAULT_LEVELS, selectedId, onSelect, onConfirm }) {
  const [current, setCurrent] = useState(selectedId || levels?.[1]?.id || levels?.[0]?.id)

  const handleSelect = (id) => {
    setCurrent(id)
    if (typeof onSelect === 'function') onSelect(id)
  }

  const handleConfirm = () => {
    const level = levels.find((lv) => lv.id === current)
    if (typeof onConfirm === 'function') onConfirm(level || { id: current })
  }

  return (
    <View style={styles.wrapper}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F5F0DD',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    ...(Platform.OS === 'web' && { boxShadow: '0px 8px 24px rgba(0,0,0,0.15)' }),
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
})

