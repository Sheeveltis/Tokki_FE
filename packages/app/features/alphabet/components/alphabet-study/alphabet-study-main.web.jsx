import React, { useState } from 'react'
import { View, Text, StyleSheet, Platform, Modal, TouchableOpacity } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { SoundOutlined, EditOutlined, HighlightOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { FlashcardActionButton } from '../../../study/components/shared'
import { AlphabetTable } from './alphabet-table'
import { AlphabetGuideInfo } from './alphabet-guide-info'
/**
 * AlphabetStudyMain (Web): Nội dung chính của trang học chữ cái Hàn Quốc trên web
 */
export function AlphabetStudyMain({
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
        <Text style={styles.title}>BẢNG CHỮ CÁI TIẾNG HÀN</Text>
        <FlashcardActionButton title="Kiểm tra" icon={PlayCircleOutlined} onPress={onTestPress} />
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
                 <Text style={styles.meaningText}>{current.pronunciation || current.meaning}</Text>
                 <TouchableOpacity onPress={handlePlaySound} style={styles.soundButton}>
                   <SoundOutlined style={{ fontSize: 24, color: '#D32F2F' }} />
                 </TouchableOpacity>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actions}>
              <FlashcardActionButton title="Tập đánh chữ" icon={EditOutlined} onPress={onTypingPress} />
              <FlashcardActionButton title="Vẽ chữ" icon={HighlightOutlined} onPress={onDrawingPress} />
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
    gap: 32,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#D32F2F', // match table title style
    fontFamily: 'Epilogue, sans-serif',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  tableContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 40,
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
    gap: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    flexWrap: 'wrap',
    marginTop: 20,
  },
  wordInfoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 10,
    minWidth: 200,
    paddingHorizontal: 60,
  },
  soundButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 12,
    borderRadius: 30,
    backgroundColor: '#FFF0F0',
  },
  koreanWord: {
    fontSize: 120,
    fontWeight: '900',
    color: '#1a1a1a',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  meaningText: {
    fontSize: 32,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
})

