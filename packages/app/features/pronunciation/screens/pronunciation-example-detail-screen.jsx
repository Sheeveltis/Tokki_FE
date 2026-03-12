import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Platform, View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'

import { LoadingWithContainer } from '../../../../components/Loading'
import { getPronunciationExampleById } from '../api'
import { PronunciationLayout } from '../components/layout/pronunciation-layout'

import SoundIcon from '../../../../assets/icon/icon-mainflow/sound.svg'
import MicroIcon from '../../../../assets/icon/icon-mainflow/micro.svg'

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

export function PronunciationExampleDetailScreen({ exampleId: exampleIdProp, onBackPress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null
  const route = Platform.OS !== 'web' ? useRoute() : null

  const exampleId = exampleIdProp || route?.params?.exampleId

  const [example, setExample] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [isRecording, setIsRecording] = useState(false)

  const canLoad = useMemo(() => Boolean(exampleId), [exampleId])

  const fetchDetail = useCallback(async () => {
    if (!canLoad) {
      setExample(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const data = await getPronunciationExampleById(exampleId)
      setExample(data || null)
    } catch (e) {
      setError(e?.message || 'Không thể tải chi tiết bài học')
      setExample(null)
    } finally {
      setLoading(false)
    }
  }, [canLoad, exampleId])

  useEffect(() => {
    fetchDetail()
  }, [fetchDetail])

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
      return
    }
    if (navigation?.canGoBack?.()) navigation.goBack()
  }

  const playAudio = async () => {
    if (!example?.audioUrl || isPlaying) return
    
    try {
      setIsPlaying(true)
      
      if (Platform.OS === 'web') {
        const audio = new window.Audio(example.audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.play().catch((err) => {
          console.error('Lỗi phát Web Audio:', err)
          setIsPlaying(false)
        })
      } else {
          const { Audio } = require('expo-av') 
        
        const { sound } = await Audio.Sound.createAsync({ uri: example.audioUrl })
        await sound.playAsync()
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false)
            sound.unloadAsync()
          }
        })
      }
    } catch (err) {
      console.error('Lỗi phát âm thanh:', err)
      setIsPlaying(false)
    }
  }

  const handleRecord = () => {
    setIsRecording(!isRecording)
    console.log("Bật / Tắt Mic...")
  }

  if (loading) {
    return (
      <PronunciationLayout onBackPress={handleBack}>
        <LoadingWithContainer size={48} color="#8EAC65" text="Đang tải dữ liệu..." style={styles.centered} />
      </PronunciationLayout>
    )
  }

  if (error && !example) {
    return (
      <PronunciationLayout onBackPress={handleBack}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchDetail}>
            <Text style={styles.retryText}>Thử lại</Text>
          </Pressable>
        </View>
      </PronunciationLayout>
    )
  }

  return (
    <PronunciationLayout onBackPress={handleBack}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Quy tắc phát âm</Text>
      </View>

      {!example ? (
        <View style={styles.centered}><Text style={styles.emptyText}>Không có dữ liệu</Text></View>
      ) : (
        <View style={styles.contentWrapper}>
          
          <View style={styles.greenCard}>
            <Text style={styles.targetScriptContainer}>
              {renderHtmlText(example.targetScript, styles.targetText, styles.targetTextBold)}
            </Text>
            
            <View style={styles.actionRow}>
              <Pressable 
                onPress={playAudio} 
                style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.7 }]}
              >
                {isPlaying ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <SoundIcon width={36} height={36} />
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.micContainer}>
            <View style={styles.micOuterCircle}>
              <Pressable 
                onPress={handleRecord}
                style={({ pressed }) => [
                  styles.micButton, 
                  isRecording && styles.micButtonRecording,
                  pressed && { transform: [{ scale: 0.95 }] }
                ]}
              >
                <MicroIcon width={60} height={60} fill={isRecording ? "#FFF" : "#000"} />
              </Pressable>
            </View>
          </View>

          <View style={styles.yellowCard}>
            <Text style={styles.ruleTitle}>Quy tắc phát âm:</Text>
            <Text style={styles.ruleContentContainer}>
               {renderHtmlText(example.ruleContent, styles.ruleText, styles.ruleTextBold)}
            </Text>
          </View>

        </View>
      )}
    </PronunciationLayout>
  )
}

export default PronunciationExampleDetailScreen

const styles = StyleSheet.create({
  titleContainer: { width: '100%', alignItems: 'center', marginTop: 12, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', letterSpacing: 0.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 220 },
  
  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingHorizontal: 16,
  },

  greenCard: {
    backgroundColor: '#8EAC65',
    borderRadius: 24,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  targetScriptContainer: { textAlign: 'center', marginBottom: 24 },
  targetText: { fontSize: 24, color: '#FFF', fontFamily: 'Epilogue, sans-serif', lineHeight: 34 },
  targetTextBold: { fontWeight: '800' },
  actionRow: { flexDirection: 'row', gap: 24, justifyContent: 'center', alignItems: 'center' },
  iconButton: { padding: 8 },

  micContainer: {
    alignItems: 'center',
    marginVertical: 40, 
  },
  micOuterCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  micButtonRecording: {
    backgroundColor: '#ff4d4f',
  },

  yellowCard: {
    backgroundColor: '#FDEAA5',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleTitle: { fontSize: 16, fontWeight: '800', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', marginBottom: 8 },
  ruleContentContainer: { lineHeight: 24 },
  ruleText: { fontSize: 15, color: '#333', fontFamily: 'Epilogue, sans-serif', lineHeight: 22 },
  ruleTextBold: { fontWeight: '700', color: '#000' },

  errorText: { fontSize: 14, color: '#ff4d4f', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#8EAC65', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  emptyText: { fontSize: 14, color: '#666' },
})