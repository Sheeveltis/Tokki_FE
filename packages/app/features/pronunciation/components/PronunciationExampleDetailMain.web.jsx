import React from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Animated } from 'react-native'
import { LoadingWithContainer } from '../../../../components/Loading'
import {
  PronunciationFeedbackText,
  getScoreColor,
  renderHtmlText
} from './PronunciationFeedbackText'

import SoundIcon from '../../../../assets/icon/icon-mainflow/sound.svg'
import MicroIcon from '../../../../assets/icon/icon-mainflow/micro.svg'

export function PronunciationExampleDetailMain({
  example,
  loading,
  error,
  isPlaying,
  isRecording,
  evaluating,
  result,
  evalError,
  pulseAnim,
  audioLevel,
  onPlayAudio,
  onStartRecording,
  onStopRecording,
}) {
  if (loading) return (
    <View style={styles.centered}>
      <LoadingWithContainer size={40} color="#8EAC65" />
    </View>
  )

  if (!example && !loading) return (
    <View style={styles.centered}>
      <Text style={styles.emptyText}>Không tìm thấy dữ liệu</Text>
    </View>
  )

  return (
    <View style={styles.contentWrapper}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Luyện phát âm</Text>
      </View>

      <View style={styles.greenCard}>
        {result && (
          <View style={styles.scoreCircle}>
            <Text style={[styles.scoreText, { color: getScoreColor(result.score) }]}>
              {result.score}
            </Text>
          </View>
        )}
        <View style={styles.actionRow}>
          <Pressable onPress={onPlayAudio} style={styles.audioButtonWrapper}>
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
            onPress={() => isRecording ? onStopRecording() : onStartRecording()}
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
        
        {isRecording && (
          <View style={styles.volumeContainer}>
            <View style={[styles.volumeBar, { width: `${audioLevel}%` }]} />
          </View>
        )}
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
  )
}

const styles = StyleSheet.create({
  titleContainer: { width: '100%', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 44, fontWeight: '900', color: '#1F1F1F', fontFamily: 'Epilogue, sans-serif', textAlign: 'center' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, minHeight: 400 },

  contentWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
    paddingHorizontal: 24,
  },

  greenCard: {
    backgroundColor: '#8EAC65',
    borderRadius: 32,
    paddingVertical: 32,
    paddingHorizontal: 48,
    alignItems: 'center',
    shadowColor: '#8EAC65',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
    width: '100%',
  },

  targetDescription: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
  },
  targetPhonetic: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: 'Epilogue, sans-serif',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  actionRow: { width: '100%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  audioButtonWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreCircle: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: 20,
    fontWeight: '900',
    fontFamily: 'Epilogue, sans-serif',
  },

  feedbackBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E6E6E6',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 16,
    color: '#34495E',
    lineHeight: 24,
    fontFamily: 'Epilogue, sans-serif',
    fontWeight: '500',
  },

  micSection: { alignItems: 'center', marginVertical: 24 },
  micOuterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  statusText: { fontSize: 15, fontWeight: '700', color: '#8E9AAF', fontFamily: 'Epilogue, sans-serif', marginTop: 12 },
  statusTextRecording: { color: '#FF4757' },

  evalErrorWrapper: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFE3E3',
  },

  yellowCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginTop: 8,
    width: '100%',
  },
  ruleBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  ruleTitleText: { fontSize: 13, fontWeight: '900', color: '#B45309', fontFamily: 'Epilogue, sans-serif', textTransform: 'uppercase', letterSpacing: 0.6 },
  ruleContentContainer: { lineHeight: 28 },
  ruleText: { fontSize: 17, color: '#4B5563', fontFamily: 'Epilogue, sans-serif', lineHeight: 26 },
  ruleTextBold: { fontWeight: '700', color: '#1F2937' },
  errorText: { fontSize: 15, color: '#E74C3C', textAlign: 'center' },
  emptyText: { fontSize: 16, color: '#94A3B8' },
  volumeContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  volumeBar: {
    height: '100%',
    backgroundColor: '#8EAC65',
  },
})
