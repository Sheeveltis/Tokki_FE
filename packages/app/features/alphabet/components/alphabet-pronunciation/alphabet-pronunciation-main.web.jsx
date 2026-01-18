import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from '../../../../../assets/icon/icon-mainflow/arrow.svg'
import { ALPHABET_LETTERS } from '../../../study/mockData'
import { studyStyles } from '../../../study/styles'
import { LetterDisplayCard, PlayButton } from '../../api/alphabet-pronunciation-index'
import { InstructionsBox, PaginationControls } from '../../api/alphabet-typing-index'

/**
 * AlphabetPronunciationMain (Web): Nội dung chính của trang tập phát âm chữ cái Hàn Quốc trên web
 */
export function AlphabetPronunciationMain({
  current,
  currentIndex,
  isPlaying,
  onBackPress,
  onPlay,
  onNext,
  onPrev,
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
      </View>

      <Text style={styles.title}>Tập Phát Âm</Text>

      {/* Letter Display */}
      <LetterDisplayCard
        letter={current.word}
        meaning={current.meaning}
        pronunciation={current.pronunciation}
      />

      {/* Play Button */}
      <PlayButton isPlaying={isPlaying} onPress={onPlay} />

      {/* Instructions */}
      <InstructionsBox
        instructions={`1. Nhấn nút "Nghe phát âm" để nghe cách phát âm\n2. Lặp lại theo âm thanh bạn nghe được\n3. Sử dụng nút mũi tên để chuyển sang chữ cái khác`}
      />

      {/* Pagination */}
      <PaginationControls
        currentIndex={currentIndex}
        total={ALPHABET_LETTERS.length}
        onPrev={onPrev}
        onNext={onNext}
      />
    </>
  )
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  title: {
    ...studyStyles.pageTitle,
  },
})

