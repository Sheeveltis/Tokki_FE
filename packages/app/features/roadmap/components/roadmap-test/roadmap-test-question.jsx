import React, { useState, useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View, Platform, TextInput } from 'react-native'
import { RoadmapTestAnswer } from './roadmap-test-answer'

export function RoadmapTestQuestion({
  questionNumber = 1,
  type = 'text', // 'audio', 'text', or 'writing'
  questionText = '',
  audioUrl = null,
  imageUrl = null,
  options = [],
  questionTypeCode = null,
  selectedAnswer = null,
  onAnswerSelect,
  onAnswerChange, // For writing type
}) {
  const [currentTime, setCurrentTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [progress, setProgress] = useState(0)
  const [progressBarLayout, setProgressBarLayout] = useState({ width: 0, x: 0 })
  const [volumeSliderLayout, setVolumeSliderLayout] = useState({ width: 0, x: 0 })
  const audioRef = useRef(null)

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  // Initialize audio element when audioUrl changes
  useEffect(() => {
    if (type === 'audio' && audioUrl && Platform.OS === 'web') {
      const audio = audioRef.current
      if (!audio) return

      // Reset state when audioUrl changes
      setCurrentTime(0)
      setProgress(0)
      setIsPlaying(false)

      const handleLoadedMetadata = () => {
        setTotalTime(audio.duration || 0)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime || 0)
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100)
        }
      }

      const handlePlay = () => {
        setIsPlaying(true)
      }

      const handlePause = () => {
        setIsPlaying(false)
      }

      const handleEnded = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        setProgress(0)
      }

      const handleVolumeChange = () => {
        setVolume(Math.round((audio.volume || 0) * 100))
      }

      audio.addEventListener('loadedmetadata', handleLoadedMetadata)
      audio.addEventListener('timeupdate', handleTimeUpdate)
      audio.addEventListener('play', handlePlay)
      audio.addEventListener('pause', handlePause)
      audio.addEventListener('ended', handleEnded)
      audio.addEventListener('volumechange', handleVolumeChange)

      // Set initial volume
      audio.volume = volume / 100

      return () => {
        // Stop and cleanup audio
        audio.pause()
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
        audio.removeEventListener('timeupdate', handleTimeUpdate)
        audio.removeEventListener('play', handlePlay)
        audio.removeEventListener('pause', handlePause)
        audio.removeEventListener('ended', handleEnded)
        audio.removeEventListener('volumechange', handleVolumeChange)
      }
    } else {
      // Reset state when not audio type or not web
      setCurrentTime(0)
      setTotalTime(0)
      setProgress(0)
      setIsPlaying(false)
    }
  }, [audioUrl, type, volume])

  const handlePlayPause = () => {
    if (Platform.OS === 'web' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error)
        })
      }
    }
  }

  const handleProgressClick = (event) => {
    if (Platform.OS === 'web' && audioRef.current && totalTime > 0 && progressBarLayout.width > 0) {
      let clickX
      
      // Try to get click position from native event (React Native Web)
      if (event.nativeEvent && typeof event.nativeEvent.locationX === 'number') {
        clickX = event.nativeEvent.locationX
      } else if (event.nativeEvent && event.nativeEvent.pageX) {
        // Fallback: calculate from pageX
        clickX = event.nativeEvent.pageX - progressBarLayout.x
      } else {
        return
      }
      
      const percentage = Math.max(0, Math.min(1, clickX / progressBarLayout.width))
      const newTime = percentage * totalTime
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeClick = (event) => {
    if (volumeSliderLayout.width > 0) {
      let clickX
      
      // Try to get click position from native event (React Native Web)
      if (event.nativeEvent && typeof event.nativeEvent.locationX === 'number') {
        clickX = event.nativeEvent.locationX
      } else if (event.nativeEvent && event.nativeEvent.pageX) {
        // Fallback: calculate from pageX
        clickX = event.nativeEvent.pageX - volumeSliderLayout.x
      } else if (Platform.OS === 'web' && event.nativeEvent) {
        // Try to get from target element
        const target = event.nativeEvent.target
        if (target) {
          const rect = target.getBoundingClientRect()
          clickX = event.nativeEvent.pageX - rect.left
        } else {
          return
        }
      } else {
        return
      }
      
      const percentage = Math.max(0, Math.min(100, (clickX / volumeSliderLayout.width) * 100))
      handleVolumeChange(percentage)
    }
  }

  const handleVolumeChange = (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(100, newVolume))
    setVolume(clampedVolume)
    if (Platform.OS === 'web' && audioRef.current) {
      audioRef.current.volume = clampedVolume / 100
    }
  }

  // Check if this is Q51 type (has 2 parts: ㉠ and ㉡)
  const isQ51 = questionTypeCode && String(questionTypeCode).slice(-3) === 'Q51'

  // Parse Q51 answer from selectedAnswer (could be object {a, b} or string)
  const parseQ51Answer = () => {
    if (!selectedAnswer) return { a: '', b: '' }
    if (typeof selectedAnswer === 'object' && selectedAnswer !== null) {
      return { a: selectedAnswer.a || '', b: selectedAnswer.b || '' }
    }
    // If it's a string, try to parse it
    const text = String(selectedAnswer || '')
    const idxA = text.indexOf('㉠')
    const idxB = text.indexOf('㉡')
    if (idxA >= 0 && idxB >= 0) {
      if (idxA < idxB) {
        return {
          a: text.slice(idxA + 2, idxB).replace(/^:\s*/, '').trim(),
          b: text.slice(idxB + 2).replace(/^:\s*/, '').trim(),
        }
      } else {
        return {
          a: text.slice(idxA + 2).replace(/^:\s*/, '').trim(),
          b: text.slice(idxB + 2, idxA).replace(/^:\s*/, '').trim(),
        }
      }
    }
    return { a: '', b: '' }
  }

  const q51Answer = isQ51 ? parseQ51Answer() : null

  const handleQ51Change = (part, value) => {
    if (!onAnswerChange) return
    const newAnswer = {
      ...q51Answer,
      [part]: value,
    }
    onAnswerChange(newAnswer)
  }


  return (
    <View style={styles.container}>
      {/* Question Title */}
      <Text style={styles.questionTitle}>Câu hỏi {questionNumber}:</Text>

      {/* Audio Player or Question Text */}
      {type === 'audio' ? (
        Platform.OS === 'web' && audioUrl ? (
          <View style={styles.audioWebWrapper}>
            <audio controls src={audioUrl} style={{ width: '100%' }} />
          </View>
        ) : (
          <View style={styles.questionTextContainer}>
            <Text style={styles.questionText}>
              Audio chỉ hỗ trợ trên phiên bản web.
            </Text>
          </View>
        )
      ) : (
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText}>{questionText || 'Câu hỏi mẫu'}</Text>
        </View>
      )}

      {/* Options */}
      {type !== 'writing' && (
        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
            <Text key={index} style={styles.optionText}>
              {index + 1}: {option}
            </Text>
          ))}
        </View>
      )}

      {/* Writing Input or Answer Selection Buttons */}
      {type === 'writing' ? (
        <View style={styles.writingContainer}>
          {imageUrl && (
            <View style={styles.writingImageContainer}>
              {Platform.OS === 'web' ? (
                <img
                  src={imageUrl}
                  alt="Question image"
                  style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 12 }}
                />
              ) : (
                <Text style={styles.writingImagePlaceholder}>[Image: {imageUrl}]</Text>
              )}
            </View>
          )}
          
          {isQ51 ? (
            // Q51: 2 separate inputs for ㉠ and ㉡
            <>
              <Text style={styles.writingLabel}>Nhập câu trả lời:</Text>
              <View style={styles.q51Container}>
                <View style={styles.q51PartContainer}>
                  <Text style={styles.q51PartLabel}>㉠:</Text>
                  {Platform.OS === 'web' ? (
                    <textarea
                      value={q51Answer?.a || ''}
                      onChange={(e) => handleQ51Change('a', e.target.value)}
                      placeholder="Nhập phần ㉠..."
                      style={styles.q51Textarea}
                      rows={4}
                    />
                  ) : (
                    <TextInput
                      value={q51Answer?.a || ''}
                      onChangeText={(text) => handleQ51Change('a', text)}
                      placeholder="Nhập phần ㉠..."
                      style={styles.q51TextInput}
                      multiline
                      textAlignVertical="top"
                    />
                  )}
                </View>
                <View style={styles.q51PartContainer}>
                  <Text style={styles.q51PartLabel}>㉡:</Text>
                  {Platform.OS === 'web' ? (
                    <textarea
                      value={q51Answer?.b || ''}
                      onChange={(e) => handleQ51Change('b', e.target.value)}
                      placeholder="Nhập phần ㉡..."
                      style={styles.q51Textarea}
                      rows={4}
                    />
                  ) : (
                    <TextInput
                      value={q51Answer?.b || ''}
                      onChangeText={(text) => handleQ51Change('b', text)}
                      placeholder="Nhập phần ㉡..."
                      style={styles.q51TextInput}
                      multiline
                      textAlignVertical="top"
                    />
                  )}
                </View>
              </View>
            </>
          ) : (
            // Regular writing: single textarea
            <>
              <Text style={styles.writingLabel}>Nhập câu trả lời:</Text>
              {Platform.OS === 'web' ? (
                <textarea
                  value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                  onChange={(e) => {
                    if (onAnswerChange) {
                      onAnswerChange(e.target.value)
                    }
                  }}
                  placeholder="Nhập câu trả lời của bạn ở đây..."
                  style={styles.writingTextarea}
                  rows={8}
                />
              ) : (
                <TextInput
                  value={typeof selectedAnswer === 'string' ? selectedAnswer : ''}
                  onChangeText={onAnswerChange}
                  placeholder="Nhập câu trả lời của bạn ở đây..."
                  style={styles.writingTextInput}
                  multiline
                  textAlignVertical="top"
                />
              )}
            </>
          )}
        </View>
      ) : (
        <RoadmapTestAnswer
          selectedAnswer={selectedAnswer}
          onAnswerSelect={onAnswerSelect}
          containerStyle={styles.answerButtonsContainer}
          buttonSize={40}
          gap={16}
        />
      )}
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
  audioWebWrapper: {
    width: '100%',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    }),
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
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    }),
  },
  playButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  playIconTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: '#4A4A4A',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 2,
  },
  pauseIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 20,
    height: 20,
  },
  pauseBar: {
    width: 3,
    height: 12,
    backgroundColor: '#4A4A4A',
    borderRadius: 1,
  },
  playIconText: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  timeText: {
    fontSize: 13,
    color: '#4A4A4A',
    fontFamily: 'Epilogue, sans-serif',
    minWidth: 40,
    fontWeight: '500',
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    overflow: 'visible',
  },
  progressBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A4A4A',
    borderRadius: 2,
    ...(Platform.OS === 'web' && {
      transition: 'width 0.1s linear',
    }),
  },
  progressDot: {
    position: 'absolute',
    top: -4,
    marginLeft: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4A4A4A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...(Platform.OS === 'web' && {
      transition: 'left 0.1s linear',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
    }),
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  volumeIcon: {
    fontSize: 16,
    color: '#4A4A4A',
  },
  volumeSlider: {
    width: 60,
    height: 4,
    borderRadius: 2,
    position: 'relative',
    cursor: Platform.OS === 'web' ? 'pointer' : 'default',
    overflow: 'visible',
    ...(Platform.OS === 'web' && {
      userSelect: 'none',
    }),
  },
  volumeBar: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    position: 'relative',
    overflow: 'visible',
  },
  volumeFill: {
    height: '100%',
    backgroundColor: '#4A4A4A',
    borderRadius: 2,
    ...(Platform.OS === 'web' && {
      transition: 'width 0.1s linear',
    }),
  },
  volumeDot: {
    position: 'absolute',
    top: -2,
    marginLeft: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A4A4A',
    ...(Platform.OS === 'web' && {
      transition: 'left 0.1s linear',
      boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.2)',
    }),
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
  writingContainer: {
    gap: 12,
  },
  writingImageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  writingImagePlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  writingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 8,
  },
  writingTextarea: {
    width: '100%',
    minHeight: 200,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    resize: 'vertical',
    outline: 'none',
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
    }),
  },
  writingTextInput: {
    width: '100%',
    minHeight: 200,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  q51Container: {
    gap: 16,
  },
  q51PartContainer: {
    gap: 8,
  },
  q51PartLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
  },
  q51Textarea: {
    width: '100%',
    minHeight: 120,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    resize: 'vertical',
    outline: 'none',
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
    }),
  },
  q51TextInput: {
    width: '100%',
    minHeight: 120,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1C1C1C',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
})

