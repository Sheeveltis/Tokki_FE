import React, { useState, useEffect } from 'react'
import { Modal, View, Text, StyleSheet, Pressable, Platform, ActivityIndicator } from 'react-native'
import { WordleBoardContent } from '../../wordle-board/component/WordleBoardContent'
import { getWordleTopSentences, toggleWordleSentenceLike } from '../../../../api/wordle-level-api'

export function WordleLeaderboardModal({ visible, onClose, dailyWordleId }) {
  const [sentences, setSentences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!visible || !dailyWordleId) return

    const fetchTopSentences = async () => {
      try {
        setLoading(true)
        const data = await getWordleTopSentences(dailyWordleId, 20)
        setSentences(data || [])
      } catch (error) {
        console.error('[WordleLeaderboardModal] Error fetching top sentences:', error)
        setSentences([])
      } finally {
        setLoading(false)
      }
    }

    fetchTopSentences()
  }, [visible, dailyWordleId])

  const handleLike = async (submissionId, isLiked) => {
    try {
      if (!isLiked) return
      await toggleWordleSentenceLike(submissionId)
      setSentences(prev =>
        prev.map(item =>
          item.submissionId === submissionId
            ? {
              ...item,
              isLiked: true,
              likeCount: (item.likeCount || 0) + 1,
            }
            : item
        )
      )
    } catch (error) {
      console.error('[WordleLeaderboardModal] Error toggling like:', error)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.boardContainer}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.titleText}>BẢNG XẾP HẠNG</Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <WordleBoardContent
              sentences={sentences}
              onLike={handleLike}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  boardContainer: {
    width: '95%',
    maxWidth: 900,
    height: Platform.OS === 'web' ? '85vh' : '85%',
    backgroundColor: '#F3E5AB', // Light wood/parchment color
    borderRadius: 32,
    borderWidth: 8,
    borderColor: '#5D4037', // Dark wood border
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    // Cartoon-style hard shadow for web
    ...(Platform.OS === 'web' && {
      boxShadow: '8px 8px 0px 0px rgba(93, 64, 55, 0.4)',
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
    height: 60,
    zIndex: 2,
  },
  titleContainer: {
    backgroundColor: '#8D6E63', // Woody brown to match theme
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#5D4037',
    transform: [{ rotate: '-1deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
    fontFamily: Platform.select({
      web: 'Epilogue, sans-serif',
      default: undefined,
    }),
  },
  closeBtn: {
    position: 'absolute',
    right: -10,
    top: -10,
    width: 44,
    height: 44,
    backgroundColor: '#FF5252',
    borderRadius: 22,
    borderWidth: 4,
    borderColor: '#D32F2F',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFDE7', // Slightly warmer paper color
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#A1887F', // Medium wood accent
    overflow: 'hidden',
    marginTop: 10,
  },
})

