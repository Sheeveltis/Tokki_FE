import React, { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { RoadmapTestAnswer } from './roadmap-test-answer'

export function RoadmapTestQuestion({
  questionNumber = 1,
  type = 'text', // 'audio' or 'text'
  questionText = '',
  audioUrl = null,
  options = [],
  selectedAnswer = null,
  onAnswerSelect,
}) {
  const [currentTime, setCurrentTime] = useState('01:10')
  const [totalTime, setTotalTime] = useState('04:10')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement audio playback logic
  }


  return (
    <View style={styles.container}>
      {/* Question Title */}
      <Text style={styles.questionTitle}>Câu hỏi {questionNumber}:</Text>

      {/* Audio Player or Question Text */}
      {type === 'audio' ? (
        <View style={styles.audioPlayer}>
          <Pressable onPress={handlePlayPause} style={styles.playButton}>
            <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
          </Pressable>
          <Text style={styles.timeText}>{currentTime}</Text>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '27%' }]} />
              <View style={styles.progressDot} />
            </View>
          </View>
          <Text style={styles.timeText}>{totalTime}</Text>
          <View style={styles.volumeContainer}>
            <Text style={styles.volumeIcon}>🔊</Text>
            <View style={styles.volumeSlider}>
              <View style={[styles.volumeFill, { width: `${volume}%` }]} />
              <View style={styles.volumeDot} />
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText}>{questionText || 'Câu hỏi mẫu'}</Text>
        </View>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <Text key={index} style={styles.optionText}>
            {index + 1}: {option}
          </Text>
        ))}
      </View>

      {/* Answer Selection Buttons */}
      <RoadmapTestAnswer
        selectedAnswer={selectedAnswer}
        onAnswerSelect={onAnswerSelect}
        containerStyle={styles.answerButtonsContainer}
        buttonSize={40}
        gap={16}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF8F0',
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 20,
    // Inner shadow và upper shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    // Inner shadow effect (sử dụng border để tạo hiệu ứng)
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1C1C1C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 2,
  },
  timeText: {
    fontSize: 14,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    minWidth: 50,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1C1C1C',
    borderRadius: 2,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1C1C1C',
    borderRadius: 2,
  },
  progressDot: {
    position: 'absolute',
    right: -6,
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF8C00',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeIcon: {
    fontSize: 16,
  },
  volumeSlider: {
    width: 60,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#1C1C1C',
    borderRadius: 2,
  },
  volumeDot: {
    position: 'absolute',
    right: -4,
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1C1C1C',
  },
  questionTextContainer: {
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
  },
  answerButtonsContainer: {
    justifyContent: 'flex-start',
    paddingLeft: 15,
  },
})

