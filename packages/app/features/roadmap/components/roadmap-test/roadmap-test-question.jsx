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
                      style={{
                        ...styles.q51Textarea,
                        lineHeight: '1.5',
                        ...(Platform.OS === 'web' && { outline: 'none' })
                      }}
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
                      style={{
                        ...styles.q51Textarea,
                        lineHeight: '1.5',
                        ...(Platform.OS === 'web' && { outline: 'none' })
                      }}
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
                  style={{
                    ...styles.writingTextarea,
                    lineHeight: '1.5',
                    ...(Platform.OS === 'web' && { outline: 'none' })
                  }}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
    }),
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
    letterSpacing: -0.5,
  },
  questionTextContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
    marginBottom: 4,
  },
  questionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Epilogue, sans-serif',
    lineHeight: 24,
    fontWeight: '500',
  },
  audioWebWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  optionsContainer: {
    gap: 10,
  },
  optionsImageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  answerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
  },
  answerOptionWithImage: {
    width: '49%',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 8,
  },
  answerOptionSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  answerOptionLabel: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '800',
    width: 20,
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  writingContainer: {
    gap: 12,
  },
  writingLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  writingTextarea: {
    width: '100%',
    lineHeight: 22, // Fallback for mobile
    minHeight: 180,
    padding: 16,
    fontSize: 15,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 16,
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
      outlineStyle: 'none',
      resize: 'vertical',
    }),
  },
  q51Container: {
    gap: 16,
  },
  q51PartContainer: {
    gap: 8,
  },
  q51PartLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  q51Textarea: {
    width: '100%',
    lineHeight: 22, // Fallback for mobile
    minHeight: 80,
    padding: 12,
    fontSize: 15,
    fontFamily: 'Epilogue, sans-serif',
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      boxSizing: 'border-box',
    }),
  },
  optionImage: {
    maxWidth: '100%',
    height: 150,
    borderRadius: 10,
    resizeMode: 'contain',
  },
})

