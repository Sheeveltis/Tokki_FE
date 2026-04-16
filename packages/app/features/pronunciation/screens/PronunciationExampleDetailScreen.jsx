import React from 'react'
import { Platform } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { usePronunciationExampleDetail } from '../hooks/usePronunciationExampleDetail'
import { PronunciationLayout } from '../components/layout/PronunciationLayout'
import { PronunciationExampleDetailMain as WebMain } from '../components/PronunciationExampleDetailMain.web'
import { PronunciationExampleDetailMain as MobileMain } from '../components/PronunciationExampleDetailMain.mobile'

/**
 * PronunciationExampleDetailScreen: Trang chi tiết bài luyện phát âm
 * Điều phối giữa web và mobile layout/main
 */
export function PronunciationExampleDetailScreen({ exampleId: exampleIdProp, onBackPress }) {
  const navigation = Platform.OS !== 'web' ? useNavigation() : null
  const route = Platform.OS !== 'web' ? useRoute() : null
  const exampleId = exampleIdProp || route?.params?.exampleId

  const {
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
    fetchDetail
  } = usePronunciationExampleDetail(exampleId)

  const Main = Platform.OS === 'web' ? WebMain : MobileMain

  const handleBack = () => {
    if (onBackPress) {
      onBackPress()
      return
    }
    if (navigation?.canGoBack?.()) navigation.goBack()
  }

  return (
    <PronunciationLayout onBackPress={handleBack} title="Luyện phát âm">
      <Main
        example={example}
        loading={loading}
        error={error}
        isPlaying={isPlaying}
        isRecording={isRecording}
        evaluating={evaluating}
        result={result}
        evalError={evalError}
        pulseAnim={pulseAnim}
        audioLevel={audioLevel}
        onPlayAudio={playAudio}
        onStartRecording={startRecording}
        onStopRecording={stopRecording}
        onRetry={fetchDetail}
      />
    </PronunciationLayout>
  )
}

export default PronunciationExampleDetailScreen


