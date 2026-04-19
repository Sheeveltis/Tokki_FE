import React, { useState, useEffect } from 'react'
import { Modal, View, Text, StyleSheet, ImageBackground, Pressable, Platform, ActivityIndicator } from 'react-native'
import { WordleBoardContent } from '../../wordle-board/component/WordleBoardContent'
import { getWordleTopSentences, toggleWordleSentenceLike } from '../../../../api/wordle-level-api'
import BoardBackgroundImage from '../../../../../../../assets/wordle-board.png'
import TitleBadge from '../../../../../../../assets/BannerWordle.png'

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
        <ImageBackground
          source={BoardBackgroundImage}
          style={styles.boardContainer}
          imageStyle={styles.boardBgImage}
        >
          <View style={styles.header}>
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
        </ImageBackground>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  boardContainer: {
    width: '100%',
    maxWidth: 1400,
    height: Platform.OS === 'web' ? '85vh' : '80%',
    padding: 24,
    paddingTop: 40,
    justifyContent: 'flex-start',
    position: 'relative',
  },
  boardBgImage: {
    resizeMode: 'stretch',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    position: 'relative',
    height: 100,
  },
  titleWrapper: {
    width: 260,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -40,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 15,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  closeBtn: {
    position: 'absolute',
    right: 13,
    top: -30,
    width: 50,
    height: 50,
    backgroundColor: 'rgba(116, 116, 116, 1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  bottomCloseBtn: {
    marginTop: 20,
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  bottomCloseBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
