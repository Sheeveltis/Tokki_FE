import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import { ALPHABET_LETTERS } from '../../../mockData'
import { VirtualKoreanKeyboard } from '../../../components/virtual-korean-keyboard'
import {
  ScoreDisplay,
  LetterCard,
  TypingInput,
  CheckButton,
  InstructionsBox,
  PaginationControls,
} from '../index'

/**
 * AlphabetTypingMain (Mobile): Nội dung chính của trang tập đánh chữ cái Hàn Quốc trên mobile
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
        <NavigationPill
          label="Trở lại"
          to={undefined}
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
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
  instructionsContainer: {
    width: '100%',
    maxWidth: 500,
    position: 'absolute',
    top: 80,
    right: 16,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
})

