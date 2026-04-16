import React, { useRef } from 'react'
import { StyleSheet, Text, View, Pressable, Platform } from 'react-native'
import { MatchingCardTopic } from './matching-card-topic'

/**
 * Popup chọn chủ đề cho Matching Card
 */
export function MatchingCardTopicPopup({ visible, levelId, onClose, onConfirm }) {
  const topicRef = useRef(null)

  if (!visible) return null

  const handleConfirm = () => {
    if (topicRef.current) {
      topicRef.current.confirm()
    }
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.content}>
          <MatchingCardTopic
            ref={topicRef}
            levelId={levelId || 'easy'}
            onConfirm={onConfirm}
          />
        </View>

        <View style={styles.actions}>
          <Pressable style={[styles.button, styles.buttonCancel]} onPress={onClose}>
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
    backgroundColor: 'rgba(250, 250, 250, 0.85)', // Light overlay like Flashcard list background
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    elevation: 20,
    paddingHorizontal: 16,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    width: '100%',
    maxWidth: 640,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && { 
      boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
    }),
  },
  content: {
    flex: 1,
    minHeight: 400,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 20,
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

export default MatchingCardTopicPopup
