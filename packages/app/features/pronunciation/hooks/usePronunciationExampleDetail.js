import { useCallback, useEffect, useState, useRef } from 'react'
import { Platform, Animated } from 'react-native'
import { getPronunciationExampleById } from '../api'
import { ENDPOINTS, API_BASE_URL, DOMAIN } from '../../../provider/api/endpoints'
import { usePronunciationEvaluation } from '../api/usePronunciationEvaluation'

// Conditionally import expo-av for native platforms
let ExpoAudio = null
if (Platform.OS !== 'web') {
  try {
    ExpoAudio = require('expo-av').Audio
  } catch (e) {
    console.warn('expo-av not available', e)
  }
}

/**
 * Hook xử lý logic cho PronunciationExampleDetailScreen
 */
export function usePronunciationExampleDetail(exampleId) {
  const [example, setExample] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState(null)
  const [pulseAnim] = useState(new Animated.Value(1))
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const animationFrameRef = useRef(null)

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
      setError(e?.message || 'Không thể tải dữ liệu chi tiết')
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

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recording && Platform.OS !== 'web') {
        recording.stopAndUnloadAsync().catch(() => { })
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      if (audioContextRef.current) audioContextRef.current.close().catch(() => { })
    }
  }, [recording])

  const playAudio = async (rate = 0.75) => {
    if (isPlaying) return

    const safeRate = Number.isFinite(Number(rate)) ? Number(rate) : 0.75

    // Nếu có audioUrl: Ưu tiên phát file audio từ server
    if (example?.audioUrl) {
      try {
        setIsPlaying(true)
        const fullAudioUrl = example.audioUrl.startsWith('http') ? example.audioUrl : `${DOMAIN}${example.audioUrl}`
        console.log('DEBUG: Playing pronunciation audio from URL:', fullAudioUrl)

        if (Platform.OS === 'web') {
          const audio = new window.Audio(fullAudioUrl)
          audio.playbackRate = safeRate

          audio.onended = () => {
            console.log('DEBUG: Audio playback ended')
            setIsPlaying(false)
          }

          audio.onerror = (e) => {
            console.warn('DEBUG: Audio file error, falling back to TTS', e)
            setIsPlaying(false)
            playTTS(example.targetScript, safeRate)
          }

          audio.play()
            .then(() => {
              console.log('DEBUG: Audio playback started success')
            })
            .catch((err) => {
              console.error('DEBUG: Play failed:', err)
              setIsPlaying(false)
              playTTS(example.targetScript, safeRate)
            })
        } else if (ExpoAudio) {
          const { sound } = await ExpoAudio.Sound.createAsync(
            { uri: fullAudioUrl },
            { shouldPlay: true, rate: rate, shouldCorrectPitch: true }
          )
          sound.setOnPlaybackStatusUpdate((s) => {
            if (s.didJustFinish) {
              setIsPlaying(false)
              sound.unloadAsync()
            }
          })
        }
        return
      } catch (err) {
        console.error('DEBUG: Play audio error, trying TTS:', err)
        setIsPlaying(false)
        if (example?.targetScript) {
          playTTS(example.targetScript, safeRate)
        }
      }
    }

    // Nếu không có audioUrl hoặc bị lỗi: Sử dụng Text-to-Speech (TTS)
    if (example?.targetScript) {
      console.log('DEBUG: Playing pronunciation via TTS (Fallback/No URL)')
      playTTS(example.targetScript, safeRate)
    }
  }

  const playTTS = (text, safeRate) => {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      setIsPlaying(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ko-KR' // Tiếng Hàn
      utterance.rate = safeRate
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => setIsPlaying(false)
      window.speechSynthesis.speak(utterance)
    } else {
      console.warn('TTS not supported on this platform')
    }
  }

  const startRecording = async () => {
    resetEvaluation()
    if (Platform.OS === 'web') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const recorder = new MediaRecorder(stream)
        const chunks = []
        recorder.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data)
        recorder.onstop = async () => {
          if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
          if (audioContextRef.current) audioContextRef.current.close()
          setAudioLevel(0)
          const blob = new Blob(chunks, { type: 'audio/m4a' })
          await evaluate(blob, exampleId)
          stream.getTracks().forEach(t => t.stop())
        }

        // Web Audio API for metering
        const audioContext = new (window.AudioContext || window.webkitAudioContext)()
        const source = audioContext.createMediaStreamSource(stream)
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        source.connect(analyser)

        audioContextRef.current = audioContext
        analyserRef.current = analyser

        const updateLevel = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount)
          analyser.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
          const average = sum / dataArray.length
          setAudioLevel(Math.min(100, (average / 128) * 100))
          animationFrameRef.current = requestAnimationFrame(updateLevel)
        }
        updateLevel()

        recorder.start()
        setMediaRecorder(recorder)
        setIsRecording(true)
      } catch (err) {
        console.error('Start web recording error:', err)
      }
      return
    }

    if (!ExpoAudio) return
    try {
      await ExpoAudio.requestPermissionsAsync()
      await ExpoAudio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true })

      const recordingOptions = {
        ...ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY,
        android: {
          ...ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY.android,
          isMeteringEnabled: true,
        },
        ios: {
          ...ExpoAudio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          isMeteringEnabled: true,
        },
      }

      const { recording } = await ExpoAudio.Recording.createAsync(recordingOptions)

      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Map dB (-160 to 0) to 0-100 scale. Voice typically ranges -60 to 0.
          const level = Math.max(0, (status.metering + 60) * (100 / 60))
          setAudioLevel(Math.min(100, level))
        }
      })

      setRecording(recording)
      setIsRecording(true)
    } catch (err) {
      console.error('Start native recording error:', err)
    }
  }

  const stopRecording = async () => {
    setIsRecording(false)
    if (Platform.OS === 'web') {
      if (mediaRecorder) mediaRecorder.stop()
      setMediaRecorder(null)
      return
    }
    if (!recording) return
    try {
      await recording.stopAndUnloadAsync()
      setAudioLevel(0)
      const uri = recording.getURI()
      await evaluate(uri, exampleId)
      setRecording(null)
    } catch (err) {
      console.error('Stop native recording error:', err)
    }
  }

  return {
    example,
    loading,
    error,
    isPlaying,
    isRecording,
    evaluating,
    result,
    evalError,
    pulseAnim,
    playAudio,
    startRecording,
    stopRecording,
    audioLevel,
    fetchDetail,
    resetEvaluation
  }
}
