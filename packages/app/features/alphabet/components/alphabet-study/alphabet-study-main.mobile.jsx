import React, { useState } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { FlashcardActionButton } from '../../../study/components/shared'
import PronunciationIcon from '../../../../../assets/icon/icon-mainflow/micro.svg'
import TypingIcon from '../../../../../assets/icon/icon-mainflow/write.svg'
import DrawingIcon from '../../../../../assets/icon/icon-mainflow/bulb.svg'
import TestIcon from '../../../../../assets/icon/icon-mainflow/game.svg'
import { AlphabetTable } from './alphabet-table'
import { AlphabetGuideInfo } from './alphabet-guide-info'

/** * AlphabetStudyMain (Mobile): Nội dung chính của trang học chữ cái Hàn Quốc trên mobile
 */
export function AlphabetStudyMainMobile({
  modeTitle,
  current,
  currentIndex,
  isFlipped,
  isFavorite,
  data,
  favorites,
  onBackPress,
  onLearnPress,
  onPronunciationPress,
  onTypingPress,
  onDrawingPress,
  onTestPress,
  onFlip,
  onToggleFavorite,
  onSelectFlashcard,
  onPrev,
  onNext,
}) {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleSelectLetter = (index) => {
    onSelectFlashcard(index)
    setIsModalVisible(true)
  }

  const handlePlaySound = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && current?.word) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(current.word)
      utterance.lang = 'ko-KR'
      window.speechSynthesis.speak(utterance)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header with back and title */}
      <View style={styles.header}>
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }], tintColor: '#1A1A1A' }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
        <Text style={styles.title}>BẢNG CHỮ CÁI</Text>
        <FlashcardActionButton title="Kiểm tra" icon={TestIcon} onPress={onTestPress} />
      </View>

      {/* Alphabet Table view */}
      <View style={styles.tableContainer}>
        <AlphabetTable
          data={data}
          onSelectLetter={handleSelectLetter}
        />
        <AlphabetGuideInfo />
      </View>

      {/* Modal detail view */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Đóng ✕</Text>
            </TouchableOpacity>

            {/* Display selected letter */}
            {current && (
              <View style={styles.wordInfoContainer}>
                 <Text style={styles.koreanWord}>{current.word}</Text>
                 <TouchableOpacity onPress={handlePlaySound} style={styles.soundButton}>
                   <PronunciationIcon width={32} height={32} fill="#D32F2F" />
                 </TouchableOpacity>
                 {current.pronunciation || current.meaning ? (
                   <Text style={styles.meaningText}>{current.pronunciation || current.meaning}</Text>
                 ) : null}
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <FlashcardActionButton title="Tập đánh chữ" icon={TypingIcon} onPress={onTypingPress} />
              <FlashcardActionButton title="Vẽ chữ" icon={DrawingIcon} onPress={onDrawingPress} />
            </View>
          </View>
        </View>
      </Modal>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 20,
    flex: 1, // needed for ScrollView within Table to not get squashed
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D32F2F', // matching table header color
    fontFamily: 'Epilogue, sans-serif',
    flex: 1,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 30,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    marginTop: 30,
    width: '100%',
  },
  wordInfoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    paddingHorizontal: 20,
  },
  soundButton: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: [{ translateY: -20 }],
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#FFF0F0',
  },
  koreanWord: {
    fontSize: 96,
    fontWeight: '900',
    color: '#1a1a1a',
    textAlign: 'center',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  meaningText: {
    fontSize: 24,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
})

