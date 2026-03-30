import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View, Text, StyleSheet, Pressable, ActivityIndicator, ScrollView, Animated } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

// Conditionally import expo-av for native platforms
let ExpoAudio = null
if (Platform.OS !== 'web') {
  try {
    ExpoAudio = require('expo-av').Audio
  } catch (e) {
    console.warn('expo-av not available', e)
  }
}

import { LoadingWithContainer } from '../../../../components/Loading'
import { getPronunciationExampleById } from '../api'
import { usePronunciationEvaluation } from '../api/usePronunciationEvaluation'
import { PronunciationLayout } from '../components/layout/PronunciationLayout'

import SoundIcon from '../../../../assets/icon/icon-mainflow/sound.svg'
import MicroIcon from '../../../../assets/icon/icon-mainflow/micro.svg'

const getScoreColor = (score) => {
  if (score >= 80) return '#4CAF50'
  if (score >= 50) return '#FF9800'
  return '#F44336'
}

const renderHtmlText = (htmlString, defaultStyle, boldStyle) => {
  if (!htmlString) return null
  const cleanStr = htmlString.replace(/<\/?p>/g, '').trim()
  const parts = cleanStr.split(/(<b>|<\/b>)/g)
  let isBold = false
  return parts.map((part, index) => {
    if (part === '<b>') {
      isBold = true
      return null
    }
    if (part === '</b>') {
      isBold = false
      return null
    }
    if (part) {
      return (
        <Text key={index} style={[defaultStyle, isBold && boldStyle]}>
          {part}
        </Text>
      )
    }
    return null
  })
}

const PronunciationFeedbackText = ({ htmlString, evaluationWords }) => {
  if (!htmlString) return null
  
  const [activeWord, setActiveWord] = useState(null) // { index, guide, x, y, width, height }
  const wrapperRef = React.useRef(null)
  const wordRefs = React.useRef({})
  
  // Clean HTML p tags
  const cleanStr = htmlString.replace(/<\/?p>/g, '').trim()
  
  // Filter out insertions to get the reference words matched by the AI
  const referenceWordsFeedback = (evaluationWords || []).filter(w => w.errorType !== 'Insertion')
  
  const getWordStyle = (feedback, isActive) => {
    if (!feedback) return { color: '#FFF' }
    if (feedback.errorType !== 'None' && feedback.accuracyScore < 50) return { color: '#F44336' }
    if (feedback.isFeedback || (feedback.errorType !== 'None' && feedback.accuracyScore < 80)) return { color: '#FFC107' }
    return { color: '#FFF' }
  }

  const handleWordPress = (idx, guide) => {
    if (activeWord?.index === idx) {
      setActiveWord(null)
      return
    }
    
    // Measure relative to the wrapper to get precise coordinates
    wordRefs.current[idx]?.measureLayout(
      wrapperRef.current,
      (x, y, width, height) => {
        setActiveWord({ index: idx, guide, x, y, width, height })
      },
      (err) => console.warn('Measure failed', err)
    )
  }

  const parseHtml = () => {
    const segments = cleanStr.split(/(<b>|<\/b>)/g)
    const elements = []
    let isBold = false
    let globalWordIdx = 0

    segments.forEach((segment, segmentIdx) => {
      if (segment === '<b>') isBold = true
      else if (segment === '</b>') isBold = false
      else if (segment) {
        const wordsInSegment = segment.split(/(\s+)/).filter(p => p !== '')
        
        wordsInSegment.forEach((wordPart, wordPartIdx) => {
          if (/\s+/.test(wordPart)) {
            elements.push(<Text key={`space-${segmentIdx}-${wordPartIdx}`}>{wordPart}</Text>)
          } else {
            const feedback = referenceWordsFeedback[globalWordIdx]
            const isActive = activeWord?.index === globalWordIdx
            const currentIdx = globalWordIdx
            
            elements.push(
              <Text 
                key={`word-${currentIdx}`}
                ref={r => wordRefs.current[currentIdx] = r}
                onPress={() => feedback?.repairGuide && handleWordPress(currentIdx, feedback.repairGuide)}
                style={[
                  styles.targetText, 
                  getWordStyle(feedback, isActive), 
                  isBold && styles.targetTextBold,
                  isActive && styles.targetTextActive,
                  feedback?.repairGuide && { textDecorationLine: 'underline', textDecorationStyle: 'dotted' }
                ]}
              >
                {wordPart}
              </Text>
            )
            globalWordIdx++
          }
        })
      }
    })
    return elements
  }

  // Determine if tooltip should be above or below (simple logic: bottom line = above)
  const isBottomLine = activeWord && activeWord.y > 40
  const tooltipWidth = 480

  return (
    <View style={styles.targetScriptWrapper} ref={wrapperRef} collapsable={false}>
      <Text style={styles.targetScriptContainer}>{parseHtml()}</Text>
      
      {activeWord && (
        <View 
          style={[
            styles.smartTooltip, 
            { 
              top: isBottomLine ? activeWord.y - 120 : activeWord.y + activeWord.height + 15, // Adjusted offset for larger bubble
              left: Math.max(10, activeWord.x + (activeWord.width / 2) - (tooltipWidth / 2)),
              width: tooltipWidth,
            }
          ]}
        >
           <View style={[isBottomLine ? styles.triangleDown : styles.triangleUp]} />
           <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipTitle}>Gợi ý sửa</Text>
              <Pressable onPress={() => setActiveWord(null)}><Text style={styles.tooltipClose}>✕</Text></Pressable>
           </View>
           <Text style={styles.tooltipContentText}>{activeWord.guide}</Text>
        </View>
      )}
    </View>
  )
}

export function PronunciationExampleDetailScreen({ exampleId: exampleIdProp, onBackPress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null
  const route = Platform.OS !== 'web' ? useRoute() : null
  const exampleId = exampleIdProp || route?.params?.exampleId

  const [example, setExample] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [pulseAnim] = useState(new Animated.Value(1))

  const { evaluate, result, loading: evaluating, error: evalError, resetEvaluation } = usePronunciationEvaluation()

  const fetchDetail = useCallback(async () => {
    if (!exampleId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await getPronunciationExampleById(exampleId)
      setExample(data)
    } catch (e) {
      setError(e?.message || 'Không thể tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [exampleId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  // Pulse animation for recording
  useEffect(() => {
    let animation = null
    if (isRecording) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
      animation.start()
    } else {
      pulseAnim.setValue(1)
    }
    return () => animation?.stop()
  }, [isRecording, pulseAnim])

  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync()
    }
  }, [recording])

  const handleBack = () => {
    if (onBackPress) return onBackPress()
    if (navigation?.canGoBack?.()) navigation.goBack()
  }

  const playAudio = async () => {
    if (!example?.audioUrl || isPlaying) return
    try {
      setIsPlaying(true)
      if (Platform.OS === 'web') {
        const audio = new window.Audio(example.audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.play()
      } else if (ExpoAudio) {
        const { sound } = await ExpoAudio.Sound.createAsync({ uri: example.audioUrl })
        await sound.playAsync()
        sound.setOnPlaybackStatusUpdate((s) => s.didJustFinish && setIsPlaying(false))
      }
    } catch (err) {
      setIsPlaying(false)
    }
  }

  const [mediaRecorder, setMediaRecorder] = useState(null)

  async function startRecording() {
    resetEvaluation()
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const chunks = []
        recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/m4a' })
          await evaluate(blob, exampleId)
          stream.getTracks().forEach(t => t.stop())
        }
        recorder.start()
        setMediaRecorder(recorder)
        setIsRecording(true)
      } catch (err) { console.error(err) }
      return
    }

    if (!ExpoAudio) return
    try {
      await ExpoAudio.requestPermissionsAsync()
      await ExpoAudio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })
      const { recording } = await ExpoAudio.Recording.createAsync(ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY)
      setRecording(recording)
      setIsRecording(true)
    } catch (err) { console.error(err) }
  }

  async function stopRecording() {
    setIsRecording(false)
    if (Platform.OS === 'web') {
      if (mediaRecorder) mediaRecorder.stop()
      setMediaRecorder(null)
      return
    }
    if (!recording) return
    try {
      await recording.stopAndUnloadAsync()
      await evaluate(recording.getURI(), exampleId)
      setRecording(null)
    } catch (err) { console.error(err) }
  }

  if (loading) return (
    <PronunciationLayout onBackPress={handleBack}>
      <LoadingWithContainer size={40} color="#8EAC65" style={styles.centered} />
    </PronunciationLayout>
  )

  return (
    <PronunciationLayout onBackPress={handleBack}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Luyện phát âm</Text>
        </View>

        {!example ? (
          <View style={styles.centered}><Text style={styles.emptyText}>Không tìm thấy dữ liệu</Text></View>
        ) : (
          <View style={styles.contentWrapper}>
            <View style={styles.greenCard}>
              {result && (
                <View style={styles.scoreCircle}>
                  <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
                    {result.score}
                  </Text>
                </View>
              )}
              <View style={styles.actionRow}>
                <Pressable onPress={playAudio} style={styles.audioButtonWrapper}>
                  {isPlaying ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <SoundIcon width={32} height={32} />
                  )}
                </Pressable>
              </View>

              <PronunciationFeedbackText 
                htmlString={example.targetScript} 
                evaluationWords={result?.words} 
              />
              
              <Text style={styles.targetDescription}>{example.meaning}</Text>
              {example.phoneticScript && <Text style={styles.targetPhonetic}>[{example.phoneticScript}]</Text>}
            </View>

            {result?.aiFeedback && (
              <View style={styles.feedbackBox}>
                <Text style={styles.feedbackTitle}>Nhận xét từ Tokki:</Text>
                <Text style={styles.feedbackText}>{result.aiFeedback}</Text>
              </View>
            )}

            <View style={styles.micSection}>
              <Animated.View style={[styles.micOuterCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Pressable 
                  onPress={() => isRecording ? stopRecording() : startRecording()}
                  disabled={evaluating}
                  style={({ pressed }) => [
                    styles.micButton, 
                    isRecording && styles.micButtonRecording,
                    evaluating && styles.micButtonDisabled,
                    pressed && !evaluating && { transform: [{ scale: 0.95 }] }
                  ]}
                >
                  {evaluating ? (
                    <ActivityIndicator size="large" color="#8EAC65" />
                  ) : (
                    <MicroIcon width={40} height={40} fill={isRecording ? "#FFF" : "#8EAC65"} />
                  )}
                </Pressable>
              </Animated.View>
              <Text style={[styles.statusText, isRecording && styles.statusTextRecording]}>
                {isRecording ? 'Đang ghi âm...' : evaluating ? 'Đang phân tích...' : 'Nhấn để bắt đầu'}
              </Text>
            </View>

            {evalError && <View style={styles.evalErrorWrapper}><Text style={styles.errorText}>{evalError}</Text></View>}

            <View style={styles.yellowCard}>
              <View style={styles.ruleBadge}>
                <Text style={styles.ruleTitleText}>Quy tắc phát âm</Text>
              </View>
              <Text style={styles.ruleContentContainer}>
                {renderHtmlText(example.ruleContent, styles.ruleText, styles.ruleTextBold)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </PronunciationLayout>
  )
}

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 60, paddingTop: 10 },
  titleContainer: { width: '100%', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 36, fontWeight: '900', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 400 },
  
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 16,
  },

  greenCard: {
    backgroundColor: '#8EAC65',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#8EAC65',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 20,
    width: '100%',
  },
  
  targetDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  targetPhonetic: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 6,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  targetScriptWrapper: { width: '100%', alignItems: 'center', position: 'relative' },
  targetScriptContainer: { textAlign: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  targetText: { 
    fontSize: 26, 
    color: '#FFF', 
    fontFamily: 'Epilogue, sans-serif', 
    lineHeight: 38, 
    fontWeight: '800',
    letterSpacing: 0.5,
    paddingHorizontal: 2,
  },
  targetTextActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 6,
  },
  targetTextBold: { },
  
  smartTooltip: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFC107',
    zIndex: 9999, // Ensure it's on top of everything
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 15,
  },
  tooltipHeader: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6
  },
  tooltipTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#B08E1C',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  tooltipClose: {
    fontSize: 16,
    color: '#ABB2B9',
    fontWeight: 'bold',
    padding: 4,
  },
  tooltipContentText: {
    fontSize: 14,
    color: '#1F1F1F',
    lineHeight: 20,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '600',
  },
  triangleUp: {
    position: 'absolute',
    top: -12,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFC107',
    zIndex: 10000,
  },
  triangleDown: {
    position: 'absolute',
    bottom: -12,
    left: '50%',
    marginLeft: -10,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFC107',
    zIndex: 10000,
  },
  
  actionRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  audioButtonWrapper: { 
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
  },

  feedbackBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 6,
  },
  feedbackText: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 22,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },

  micSection: { alignItems: 'center', marginVertical: 12 },
  micOuterCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  micButtonRecording: { backgroundColor: '#FF4757', shadowColor: '#FF4757', shadowOpacity: 0.3 },
  micButtonDisabled: { backgroundColor: '#F1F2F6' },
  statusText: { fontSize: 13, fontWeight: '700', color: '#8E9AAF', fontFamily: 'Epilogue, sans-serif', marginTop: 10 },
  statusTextRecording: { color: '#FF4757' },

  evalErrorWrapper: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFE3E3',
  },

  yellowCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 4,
    width: '100%',
    alignSelf: 'stretch'
  },
  ruleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  ruleTitleText: { fontSize: 11, fontWeight: '900', color: '#B45309', fontFamily: 'Epilogue, sans-serif', textTransform: 'uppercase', letterSpacing: 0.5 },
  ruleContentContainer: { lineHeight: 24 },
  ruleText: { fontSize: 15, color: '#4B5563', fontFamily: 'Epilogue, sans-serif', lineHeight: 22 },
  ruleTextBold: { fontWeight: '700', color: '#1F2937' },

  errorText: { fontSize: 13, color: '#E74C3C', textAlign: 'center' },
  retryButton: { backgroundColor: '#8EAC65', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, marginTop: 12 },
  retryText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  emptyText: { fontSize: 14, color: '#94A3B8' },
  iconButton: { padding: 8 }
})

export default PronunciationExampleDetailScreen