import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native'
import { NavigationPill } from '../../../../../components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { ALPHABET_LETTERS } from '../../../study/mockData'
import { VirtualKoreanKeyboard } from '../../../study/components/virtual-korean-keyboard'
import {
  ScoreDisplay,
  LetterCard,
  TypingInput,
  CheckButton,
  InstructionsBox,
  PaginationControls,
} from '../../api/alphabet-typing-index'

const CloseButton = ({ onPress, style }) => {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      {...(Platform.OS === 'web' && {
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
      })}
      style={[
        styles.closeButton,
        isHovered && styles.closeButtonHover,
        style
      ]}
    >
      <Text style={[
        styles.closeButtonIcon,
        isHovered && styles.closeButtonIconHover
      ]}>✕</Text>
    </TouchableOpacity>
  )
}

/**
 * AlphabetTypingMain (Web): Nội dung chính của trang tập đánh chữ cái Hàn Quốc trên web
 */
export function AlphabetTypingMain({
  current,
  currentIndex,
  userInput,
  isCorrect,
  score,
  attempts,
  showInstructions,
  inputRef,
  onBackPress,
  onInputChange,
  onCheck,
  onKeyPress,
  onVirtualKeyPress,
  onNext,
  onPrev,
  onToggleInstructions,
}) {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 40 }} /> {/* Spacer */}
        <View style={styles.headerRight}>
          {/* Help Icon */}
          <TouchableOpacity
            style={styles.helpButton}
            onPress={onToggleInstructions}
          >
            <Text style={styles.helpIcon}>?</Text>
          </TouchableOpacity>
          {/* Score */}
          <ScoreDisplay score={score} attempts={attempts} />
          {/* Close Button */}
          <CloseButton onPress={onBackPress} />
        </View>
      </View>

      {/* Letter to Type */}
      <LetterCard meaning={current.meaning} pronunciation={current.pronunciation} />

      {/* Input */}
      <TypingInput
        ref={inputRef}
        value={userInput}
        onChangeText={onInputChange}
        onSubmitEditing={onCheck}
        onKeyPress={onKeyPress}
        isCorrect={isCorrect}
        correctAnswer={current.word}
      />

      {/* Check Button */}
      <CheckButton
        onPress={onCheck}
        disabled={!userInput.trim()}
      />

      {/* Virtual Korean Keyboard */}
      <VirtualKoreanKeyboard onKeyPress={onVirtualKeyPress} />

      {/* Pagination */}
      <PaginationControls
        currentIndex={currentIndex}
        total={ALPHABET_LETTERS.length}
        onPrev={onPrev}
        onNext={onNext}
      />
      
      {/* Instructions - Hiển thị khi click vào icon dấu chấm hỏi */}
      {showInstructions && (
        <View style={styles.instructionsContainer}>
          <InstructionsBox
            instructions={`1. Xem nghĩa và cách phát âm của chữ cái\n2. Nhập chữ cái Hàn Quốc tương ứng\n3. Nhấn "Kiểm tra" hoặc Enter để xác nhận`}
          />
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  helpButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1BE4B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0A800',
  },
  helpIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  closeButtonHover: {
    backgroundColor: '#FFEBEE',
  },
  closeButtonIcon: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  closeButtonIconHover: {
    color: '#F44336',
  },
  instructionsContainer: {
    width: '100%',
    maxWidth: 500,
    position: 'absolute',
    top: 80,
    right: 24,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})

