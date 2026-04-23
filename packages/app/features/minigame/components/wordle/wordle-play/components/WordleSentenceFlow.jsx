import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, ScrollView, Modal } from 'react-native'
import { WordleInputBar } from './WordleInputBar'
import { WordleFeedbackModal } from './WordleFeedbackModal'
import { WordlePublishPopup } from './WordlePublishPopup'
import { WordleLeaderboardModal } from './WordleLeaderboardModal'
import { submitWordleSentence, publishWordleSentence } from '../../../../api/wordle-level-api'
import { showSuccess } from '../../../../../../features/authentication/utils/notification'

export function WordleSentenceFlow({
  gameState,
  dailyWordleId,
  onNavigateToBoard,
  onRestart,
  onFlowFinished,
}) {
  const [sentence, setSentence] = useState('')
  const [isSentenceSubmitted, setIsSentenceSubmitted] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [feedbackData, setFeedbackData] = useState(null)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackLoading, setFeedbackLoading] = useState(false)
  const [showPublishPopup, setShowPublishPopup] = useState(false)
  const [showNamePopup, setShowNamePopup] = useState(false)
  const [publishLoading, setPublishLoading] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  const [isFlowFinished, setIsFlowFinished] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  // Reset toàn bộ state sentence khi restart game
  useEffect(() => {
    if (gameState === 'playing') {
      setSentence('')
      setIsSentenceSubmitted(false)
      setShowSubmitConfirm(false)
      setFeedbackData(null)
      setShowFeedbackModal(false)
      setFeedbackLoading(false)
      setShowPublishPopup(false)
      setShowNamePopup(false)
      setPublishLoading(false)
      setSubmissionId('')
      setIsFlowFinished(false)
      setShowLeaderboard(false)
    }
  }, [gameState])

  useEffect(() => {
    console.log('[WordleSentenceFlow] showFeedbackModal:', showFeedbackModal)
    console.log('[WordleSentenceFlow] feedbackData:', feedbackData)
  }, [showFeedbackModal, feedbackData])

  useEffect(() => {
    if (onFlowFinished) {
      onFlowFinished(isFlowFinished)
    }
  }, [isFlowFinished, onFlowFinished])

  const handleSentenceSubmit = () => {
    if (!sentence.trim()) {
      console.error('[WordleSentenceFlow] Sentence is empty')
      return
    }
    if (!dailyWordleId) {
      console.error('[WordleSentenceFlow] Missing dailyWordleId')
      return
    }
    setShowSubmitConfirm(true)
  }

  const handleConfirmSubmitSentence = async () => {
    if (!sentence.trim()) {
      setShowSubmitConfirm(false)
      return
    }
    if (!dailyWordleId) {
      console.error('[WordleSentenceFlow] Missing dailyWordleId')
      setShowSubmitConfirm(false)
      return
    }

    setShowSubmitConfirm(false)
    setFeedbackLoading(true)

    try {
      const sentenceContent = sentence.trim().substring(0, 150)
      const response = await submitWordleSentence(dailyWordleId, sentenceContent)

      const id = response?.submissionId || response?.data?.submissionId || response?.id
      console.log('[WordleSentenceFlow] Received submissionId:', id, 'from response:', response)
      if (id) setSubmissionId(id)

      const feedbackPayload = {
        targetWord: response?.targetWord || '',
        meaningText: response?.meaning || '',
        userSentence: sentenceContent,
        aiFeedback: response?.aiFeedback || {},
      }

      setFeedbackData(feedbackPayload)
      setIsSentenceSubmitted(true)

      setFeedbackLoading(false)

      requestAnimationFrame(() => {
        setShowFeedbackModal(true)
      })
    } catch (error) {
      console.error('[WordleSentenceFlow] Error submitting sentence:', error)
      setFeedbackLoading(false)
    }
  }

  const handleCancelSubmitSentence = () => {
    setShowSubmitConfirm(false)
  }

  const MIN_PUBLIC_SCORE = 60

  const handleFeedbackConfirm = () => {
    setIsFlowFinished(true)
    if (onFlowFinished) onFlowFinished(true)

    if (!feedbackData?.aiFeedback) {
      setShowFeedbackModal(false)
      return
    }

    const totalScore = Number(feedbackData?.aiFeedback?.totalScore ?? 0)
    setShowFeedbackModal(false)

    if (totalScore >= MIN_PUBLIC_SCORE) {
      setShowPublishPopup(true)
      return
    }
  }

  const handlePublishConfirm = async () => {
    if (!submissionId) {
      console.error('[WordleSentenceFlow] Missing submissionId')
      setShowPublishPopup(false)
      return
    }

    // Người dùng chọn "Có" cho việc công khai câu văn -> hỏi tiếp về tên
    setShowPublishPopup(false)
    setShowNamePopup(true)
  }

  const handlePublishCancel = () => {
    setShowPublishPopup(false)
    setIsFlowFinished(true)
  }

  const handleNameChoice = async (isAnonymous) => {
    if (!submissionId) {
      console.error('[WordleSentenceFlow] Missing submissionId')
      setShowNamePopup(false)
      return
    }

    try {
      setPublishLoading(true)
      // Công khai câu văn, tuỳ chọn ẩn tên
      console.log('[WordleSentenceFlow] Calling publishWordleSentence with:', { submissionId, isAnonymous })
      const res = await publishWordleSentence(submissionId, true, isAnonymous)
      console.log('[WordleSentenceFlow] publishWordleSentence response:', res)
      setShowNamePopup(false)
      setIsFlowFinished(true)

      showSuccess('Câu văn của bạn đã có ở Bảng Xếp Hạng rồi hãy đến đó để xem nhé <3')
    } catch (error) {
      console.error('[WordleSentenceFlow] Error publishing sentence with name option:', error)
    } finally {
      setPublishLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* InputBar - chỉ hiện khi đoán xong từ */}
      {gameState === 'won' && !isSentenceSubmitted && (
        <View style={styles.sentenceBox}>
          <Text style={styles.sentenceTitle}>
            Hãy nhập 1 câu có chứa từ mà bạn đã đoán đúng
          </Text>
          <WordleInputBar
            value={sentence}
            onChange={setSentence}
            onSubmit={handleSentenceSubmit}
            maxLength={150}
            disabled={false}
          />
        </View>
      )}

      <Modal
        visible={showSubmitConfirm}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={handleCancelSubmitSentence}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Bạn có chắc chắn muốn gửi câu văn này?</Text>
            <Text style={styles.confirmMessage}>
              Câu của bạn sẽ được gửi để AI chấm điểm và đưa ra nhận xét.
            </Text>

            <View style={styles.confirmButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButtonSecondary,
                  pressed && styles.confirmButtonPressed,
                ]}
                onPress={handleCancelSubmitSentence}
              >
                <Text style={styles.confirmSecondaryText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButtonPrimary,
                  pressed && styles.confirmButtonPressed,
                ]}
                onPress={handleConfirmSubmitSentence}
              >
                <Text style={styles.confirmPrimaryText}>Gửi</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {feedbackLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang chấm điểm câu văn...</Text>
          </View>
        </View>
      )}

      {/* Modal feedback chi tiết sau khi submit câu */}
      <WordleFeedbackModal
        visible={showFeedbackModal}
        loading={feedbackLoading}
        data={{
          ...feedbackData,
          userSentence: sentence,
        }}
        onConfirm={handleFeedbackConfirm}
      />

      {/* Popup hỏi có muốn công khai câu văn */}
      <WordlePublishPopup
        visible={showPublishPopup}
        loading={publishLoading}
        onConfirm={handlePublishConfirm}
        onCancel={handlePublishCancel}
      />

      <Modal
        visible={showNamePopup}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowNamePopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmCardLarge}>
            <Text style={styles.confirmTitle}>
              Bạn có muốn hiển thị tên trên bảng xếp hạng không?
            </Text>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator
              nestedScrollEnabled
            >
              <Text style={styles.confirmMessage}>
                Nếu bạn chọn ẩn danh, câu văn vẫn được công khai nhưng sẽ không hiển thị tên của bạn.
              </Text>
            </ScrollView>

            <View style={styles.confirmButtons}>
              <Pressable
                style={({ pressed }) => [
                  styles.confirmButtonSecondary,
                  pressed && styles.confirmButtonPressed,
                  publishLoading && styles.disabledButton,
                ]}
                onPress={() => handleNameChoice(true)}
                disabled={publishLoading}
              >
                <Text style={styles.confirmSecondaryText}>Không (ẩn danh)</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.confirmButtonPrimary,
                  pressed && styles.confirmButtonPressed,
                  publishLoading && styles.disabledButton,
                ]}
                onPress={() => handleNameChoice(false)}
                disabled={publishLoading}
              >
                <Text style={styles.confirmPrimaryText}>Có</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Result box - hiện sau khi đã submit câu văn hoặc flow đã xong */}
      {(isSentenceSubmitted || isFlowFinished) && (
        <View style={styles.resultBox}>
          <Text style={styles.resultText}>
            🎉 Chúc mừng bạn đã hoàn thành thử thách!
          </Text>
          <Text style={styles.userSentenceResult}>
            Câu văn của bạn:{' '}
            <Text style={styles.userSentenceBold}>"{sentence}"</Text>
          </Text>

          <View style={styles.resultButtons}>
            {!isFlowFinished && !showPublishPopup && !showNamePopup && (
              <Pressable
                style={({ pressed }) => [
                  styles.restartButton,
                  pressed && styles.confirmButtonPressed,
                ]}
                onPress={onRestart}
              >
                <Text style={styles.restartButtonText}>Chơi lại</Text>
              </Pressable>
            )}

            <Pressable
              style={({ pressed }) => [
                styles.boardButton,
                pressed && styles.confirmButtonPressed,
              ]}
              onPress={() => setShowLeaderboard(true)}
            >
              <Text style={styles.boardButtonText}>Bảng xếp hạng</Text>
            </Pressable>
          </View>
        </View>
      )}

      <WordleLeaderboardModal
        visible={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        dailyWordleId={dailyWordleId}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  sentenceBox: {
    backgroundColor: '#FFF9E3',
    width: '100%',
    maxWidth: 800,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#8D6E63',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    }),
  },
  sentenceTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#8B4513',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultBox: {
    backgroundColor: '#FFF9E3',
    padding: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#D7CCC8',
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    marginTop: 20,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
    }),
  },
  resultText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#388E3C',
    marginBottom: 15,
    textAlign: 'center',
  },
  userSentenceResult: {
    fontSize: 13,
    color: '#4E342E',
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  userSentenceBold: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
    marginBottom: 12,
  },
  restartButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  boardButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 18,
  },
  boardButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalOverlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
      },
      default: {
        flex: 1,
        zIndex: 9999,
      },
    }),
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFF5E6',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
      }
    })
  },
  confirmCardLarge: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#FFF5E6',
    borderRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 8,
      }
    })
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmMessage: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4E342E',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  confirmButtonPrimary: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonSecondary: {
    flex: 1,
    backgroundColor: '#CFD8DC',
    paddingVertical: 10,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonPressed: {
    opacity: 0.85,
  },
  confirmPrimaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#37474F',
  },
  loadingOverlay: {
    ...Platform.select({
      web: {
        position: 'fixed',
        width: '100vw',
        height: '100vh',
        zIndex: 10000,
      },
      default: {
        position: 'absolute',
        zIndex: 9999,
      },
    }),
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
      },
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 8,
      }
    }),
    minWidth: 260,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#1B5E20',
    textAlign: 'center',
  },
  resultButtons: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
})

