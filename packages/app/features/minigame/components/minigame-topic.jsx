import React, { useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, View, Image, ScrollView, Platform } from 'react-native'
import { normalizeImageSource } from '../../study/api'

import Bunny1 from '../../../../assets/bunny/1.png'
import Bunny9 from '../../../../assets/bunny/9.png'
import Bunny14 from '../../../../assets/bunny/14.png'

const DEFAULT_TOPICS = [
  { id: 'hobby', titleKo: '취미', titleVi: 'Sở thích', icon: Bunny14 },
  { id: 'family', titleKo: '가족', titleVi: 'Gia đình', icon: Bunny1 },
  { id: 'job', titleKo: '직업', titleVi: 'Công việc', icon: Bunny9 },
  { id: 'school', titleKo: '학교', titleVi: 'Trường học', icon: Bunny14 },
  { id: 'life', titleKo: '생활', titleVi: 'Đời sống sinh hoạt', icon: Bunny1 },
  { id: 'sport', titleKo: '스포츠', titleVi: 'Công việc', icon: Bunny9 },
]

/**
 * Popup chọn chủ đề minigame
 * @param {{
 *  visible: boolean
 *  topics?: Array<{ id: string, titleKo: string, titleVi: string, icon: any }>
 *  selectedId?: string
 *  onSelect?: (id: string) => void
 *  onConfirm?: (id: string) => void
 *  onClose?: () => void
 * }} props
 */
export function MinigameTopic({ visible, topics = DEFAULT_TOPICS, selectedId, onSelect, onConfirm, onClose }) {
  const [current, setCurrent] = useState(selectedId || topics?.[0]?.id)

  const handleSelect = (id) => {
    setCurrent(id)
    if (typeof onSelect === 'function') onSelect(id)
  }

  const handleConfirm = () => {
    const topic = topics.find((t) => t.id === current)
    if (typeof onConfirm === 'function') onConfirm(topic || { id: current })
    if (typeof onClose === 'function') onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>

          <Text style={styles.title}>Chủ đề</Text>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {topics.map((topic) => {
              const active = topic.id === current
              return (
                <Pressable
                  key={topic.id}
                  onPress={() => handleSelect(topic.id)}
                  style={[styles.item, active && styles.itemActive]}
                >
                  <View style={styles.itemLeft}>
                    <Image
                      source={normalizeImageSource(topic.icon)}
                      style={styles.avatar}
                      resizeMode="contain"
                    />
                  </View>

                  <View style={styles.itemDivider} />

                  <View style={styles.itemText}>
                    <Text style={styles.itemTitle}>{topic.titleKo}</Text>
                    <Text style={styles.itemSubtitle}>{topic.titleVi}</Text>
                  </View>

                  <View style={styles.itemBadge}>
                    <Text style={styles.itemBadgeText}>펀</Text>
                  </View>
                </Pressable>
              )
            })}
          </ScrollView>

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
    maxHeight: 620,
    backgroundColor: '#F5F0DD',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 16,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 12,
  },
  list: {
    flexGrow: 0,
    maxHeight: 450,
  },
  listContent: {
    gap: 12,
    paddingVertical: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FDEEB9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FDEEB9',
  },
  itemActive: {
    backgroundColor: '#F39F2D',
    borderColor: '#F39F2D',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
  itemLeft: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
  },
  itemDivider: {
    width: 2,
    height: 60,
    backgroundColor: '#F1BE4B',
    marginHorizontal: 12,
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
    fontSize: 14,
    color: '#1C1C1C',
  },
  itemBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#C45A32',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDE7D4',
  },
  itemBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#C45A32',
  },
  confirmButton: {
    marginTop: 16,
    alignSelf: 'center',
    backgroundColor: '#7FA14D',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    minWidth: 180,
    alignItems: 'center',
    ...(Platform.OS === 'web' && { cursor: 'pointer' }),
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
})
