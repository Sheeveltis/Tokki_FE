import { useState, useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View, Platform, TextInput } from 'react-native'

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
  const [, setCurrentTime] = useState(0)
  const [, setTotalTime] = useState(0)
  const [, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(100)
  const [, setProgress] = useState(0)
  const audioRef = useRef(null)

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
      audio.volume = (volume || 100) / 100

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



  // Check if this is Q51/Q52 type (has 2 parts: ㉠ and ㉡)
  const isTwoPartWriting = questionTypeCode && ['Q51', 'Q52'].includes(String(questionTypeCode).slice(-3))

  // Parse Q51/Q52 answer from selectedAnswer (could be object {a, b} or string)
  const parseTwoPartAnswer = () => {
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

  const twoPartAnswer = isTwoPartWriting ? parseTwoPartAnswer() : null

  const handleTwoPartChange = (part, value) => {
    if (!onAnswerChange) return
    const newAnswer = {
      ...twoPartAnswer,
      [part]: value,
    }
    onAnswerChange(newAnswer)
  }


  const hasImageOptions = options.some((option) => option?.imageUrl)

  const normalizeHtmlText = (value) => {
    if (!value) return ''
    return String(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+(>|$)/g, '')
  }

  const renderHtmlText = (value, style) => {
    if (Platform.OS === 'web') {
      return (
        <span
          style={{ 
            ...style, 
            display: 'block', 
            lineHeight: '1.5', // Điều chỉnh tỉ lệ này (1.4 - 1.6) để dòng khít lại
            wordBreak: 'break-word' 
          }}
          dangerouslySetInnerHTML={{ __html: String(value || '') }}
        />
      )
    }
  
    return <Text style={style}>{normalizeHtmlText(value)}</Text>
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
          {renderHtmlText(questionText || 'Câu hỏi mẫu', styles.questionText)}
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
          
          {isTwoPartWriting ? (
            // Q51/Q52: 2 separate inputs for ㉠ and ㉡
            <>
              <Text style={styles.writingLabel}>Nhập câu trả lời:</Text>
              <View style={styles.q51Container}>
                <View style={styles.q51PartContainer}>
                  <Text style={styles.q51PartLabel}>㉠:</Text>
                  {Platform.OS === 'web' ? (
                    <textarea
                      value={twoPartAnswer?.a || ''}
                      onChange={(e) => handleTwoPartChange('a', e.target.value)}
                      placeholder="Nhập phần ㉠..."
                      style={styles.q51Textarea}
                      rows={4}
                    />
                  ) : (
                    <TextInput
                      value={twoPartAnswer?.a || ''}
                      onChangeText={(text) => handleTwoPartChange('a', text)}
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
                      value={twoPartAnswer?.b || ''}
                      onChange={(e) => handleTwoPartChange('b', e.target.value)}
                      placeholder="Nhập phần ㉡..."
                      style={styles.q51Textarea}
                      rows={4}
                    />
                  ) : (
                    <TextInput
                      value={twoPartAnswer?.b || ''}
                      onChangeText={(text) => handleTwoPartChange('b', text)}
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
        <View
          style={[
            styles.optionsContainer,
            hasImageOptions && styles.optionsImageContainer,
            styles.answerSelectContainer,
          ]}
        >
          {options.map((option, index) => {
            const answerNumber = index + 1
            const isSelected = selectedAnswer === answerNumber
            return (
              <Pressable
                key={answerNumber}
                onPress={() => onAnswerSelect?.(answerNumber)}
                style={[
                  styles.answerOption,
                  option?.imageUrl && styles.answerOptionWithImage,
                  isSelected && styles.answerOptionSelected,
                ]}
              >
                <Text style={styles.answerOptionLabel}>{answerNumber}.</Text>
                {option?.imageUrl ? (
                  Platform.OS === 'web' ? (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${answerNumber}`}
                      style={styles.optionImage}
                    />
                  ) : (
                    <Text style={styles.optionImagePlaceholder}>
                      [Image: {option.imageUrl}]
                    </Text>
                  )
                ) : (
                  <Text style={styles.optionText}>{option?.content || ''}</Text>
                )}
              </Pressable>
            )
          })}
        </View>
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
    fontSize: 18,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },
  optionsContainer: {
    gap: 12,
  },
  optionsImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 16,
    rowGap: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  optionItemImage: {
    width: '48%',
  },
  optionLabel: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
    fontWeight: '600',
    minWidth: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
  },
  answerSelectContainer: {
    gap: 12,
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E2DA',
  },
  answerOptionWithImage: {
    width: '48%',
  },
  answerOptionSelected: {
    backgroundColor: '#FFE5B3',
    borderColor: '#F1B24A',
  },
  answerOptionLabel: {
    fontSize: 16,
    color: '#1C1C1C',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '700',
    lineHeight: 24,
    minWidth: 20,
  },
  optionImage: {
    maxWidth: '100%',
    width: '80%',
    height: 'auto',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionImagePlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
      outlineStyle: 'none',
      outlineWidth: 0,
      outlineColor: 'transparent',
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
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
      outlineStyle: 'none',
      outlineWidth: 0,
      outlineColor: 'transparent',
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

