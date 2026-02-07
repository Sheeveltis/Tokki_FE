'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Platform, View, Modal, StyleSheet } from 'react-native'
import { useAlphabetLearn } from '../../api/alphabet-learn-logic'
import { ALPHABET_LETTERS } from '../../../study/mockData'
import { MessageModal } from '../../../../../components/MessageModal'
import { 
  AlphabetLearnLayout as WebLayout,
  AlphabetLearnMain as WebMain,
  AlphabetLearnLayoutMobile as MobileLayout,
  AlphabetLearnMainMobile as MobileMain
} from '../../api/alphabet-learn-index'

/**
 * AlphabetLearnScreen: Trang học chữ cái Hàn Quốc
 * Điều phối giữa web và mobile layout
 */
export function AlphabetLearnScreen({
  onBackPress,
}) {
  const [slideDirection, setSlideDirection] = useState(null) // 'left' | 'right' | null
  const [showCompletionModal, setShowCompletionModal] = useState(false)
  const [hasShownModal, setHasShownModal] = useState(false) // Để tránh hiển thị modal nhiều lần
  
  const {
    index,
    isFlipped,
    learned,
    unlearnedCount,
    current,
    isFavorite,
    isLearned,
    progress,
    showInstructions,
    handleNext,
    handlePrev,
    toggleFavorite,
    markAsLearned,
    markAsNeedReview,
    setIsFlipped,
    setShowInstructions,
  } = useAlphabetLearn()

  // Kiểm tra khi progress đạt 100%
  useEffect(() => {
    if (progress === 100 && !hasShownModal) {
      setShowCompletionModal(true)
      setHasShownModal(true)
    }
  }, [progress, hasShownModal])

  const handleModalClose = () => {
    setShowCompletionModal(false)
    if (onBackPress) {
      onBackPress()
    }
  }

  const handleMarkAsLearned = useCallback(() => {
    setSlideDirection('right')
    markAsLearned()
    // Tự động chuyển sang card tiếp theo sau khi animation
    setTimeout(() => {
      handleNext()
      setSlideDirection(null)
    }, 300)
  }, [markAsLearned, handleNext])

  const handleMarkAsNeedReview = useCallback(() => {
    setSlideDirection('left')
    markAsNeedReview()
    // Tự động chuyển sang card tiếp theo sau khi animation
    setTimeout(() => {
      handleNext()
      setSlideDirection(null)
    }, 300)
  }, [markAsNeedReview, handleNext])

  // Xử lý keyboard events cho mũi tên trái/phải
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handleMarkAsNeedReview()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleMarkAsLearned()
      }
    }

    if (Platform.OS === 'web') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [handleMarkAsLearned, handleMarkAsNeedReview])

  const Layout = Platform.OS === 'web' ? WebLayout : MobileLayout
  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  return (
    <>
      <Layout>
        <Main
          current={current}
          currentIndex={index}
          isFlipped={isFlipped}
          isFavorite={isFavorite}
          isLearned={isLearned}
          progress={progress}
          learnedCount={learned.size}
          total={ALPHABET_LETTERS.length}
          unlearnedCount={unlearnedCount}
          slideDirection={slideDirection}
          showInstructions={showInstructions}
          onBackPress={onBackPress}
          onFlip={setIsFlipped}
          onToggleFavorite={toggleFavorite}
          onMarkAsLearned={handleMarkAsLearned}
          onMarkAsNeedReview={handleMarkAsNeedReview}
          onNext={handleNext}
          onPrev={handlePrev}
          onToggleInstructions={() => setShowInstructions(!showInstructions)}
        />
      </Layout>

      {/* Completion Modal */}
      <Modal
        visible={showCompletionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalOverlay}>
          <MessageModal
            title="Chúc mừng!"
            message="Bạn đã hoàn thành học tất cả các chữ cái Hàn Quốc!"
            buttonText="Trở về"
            onButtonPress={handleModalClose}
            onClose={handleModalClose}
            backgroundColor="#F5F0DD"
            buttonColor="#79964E"
          />
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
})

export default AlphabetLearnScreen
