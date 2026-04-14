import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, Text, TouchableOpacity, TextInput, Image, Modal, Dimensions, Platform, Animated } from 'react-native'
import { NavigationPill } from 'components/navigation-pill'
import ArrowIcon from 'assets/icon/icon-mainflow/arrow.svg'
import { normalizeImageSource } from '@tokki/app/features/study/api'
import { studyStyles } from '@tokki/app/features/study/styles'
import { LoadingWithContainer } from 'components/Loading'
import { FlipCardMobile } from 'components/FlipCardMobile'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import CorrectIcon from 'assets/icon/icon-mainflow/correct.svg'
import WarnIcon from 'assets/icon/icon-mainflow/warn.svg'
// Import sound effects - sử dụng require() cho React Native
// Trong React Native, require() trả về một số (module ID) hoặc object
let CorrectSfx = null
let WrongSfx = null

try {
  const correctModule = require('assets/sound-effect/correct.wav')
  const wrongModule = require('assets/sound-effect/wrong.wav')
  
  // Xử lý các trường hợp khác nhau của require()
  // Trường hợp 1: require() trả về number trực tiếp (module ID)
  if (typeof correctModule === 'number') {
    CorrectSfx = correctModule
  } 
  // Trường hợp 2: require() trả về object có default
  else if (correctModule && typeof correctModule === 'object') {
    CorrectSfx = correctModule.default || correctModule
  }
  // Trường hợp 3: require() trả về string (URL)
  else if (typeof correctModule === 'string') {
    CorrectSfx = correctModule
  }
  else {
    CorrectSfx = correctModule
  }
  
  if (typeof wrongModule === 'number') {
    WrongSfx = wrongModule
  } 
  else if (wrongModule && typeof wrongModule === 'object') {
    WrongSfx = wrongModule.default || wrongModule
  }
  else if (typeof wrongModule === 'string') {
    WrongSfx = wrongModule
  }
  else {
    WrongSfx = wrongModule
  }
} catch (e) {
  // Thử load lại với đường dẫn khác nếu có thể
  try {
    // Fallback: thử với đường dẫn từ root
    CorrectSfx = require('assets/sound-effect/correct.wav')
    WrongSfx = require('assets/sound-effect/wrong.wav')
  } catch (e2) {
    // Fallback failed
  }
}


// Import expo-av và expo-asset cho mobile (nếu có)
let ExpoAudio = null
let ExpoAudioMode = null
let Asset = null
if (Platform.OS !== 'web') {
  try {
    const expoAv = require('expo-av')
    ExpoAudio = expoAv.Audio
    ExpoAudioMode = expoAv.Audio
  } catch (e) {
  }
  try {
    Asset = require('expo-asset').Asset
  } catch (e) {
  }
}

export function FlashcardFirstLearnMain({
  title,
  current,
  currentIndex,
  total,
  currentStepKey,
  isFlipped,
  loading,
  error,
  userAnswer,
  showResult,
  isCorrect,
  setUserAnswer,
  onFlip,
  onSubmit,
  onContinue,
  canContinue,
  onBackPress,
  onRetry,
  onPlaySound,
  progress,
  isTopicCompleted,
  showContinueDialog,
  hasMoreFlashcards,
  allWordsCompleted,
  onContinueLearning,
  onStopLearning,
  completedInBatch = 0,
  batchSize = 5,
}) {
  // SFX đúng/sai sau khi bấm "Kiểm tra" (chỉ bước 2 & 3, mobile)
  const lastSfxKeyRef = useRef('')
  const lastIsCorrectRef = useRef(null)
  const lastStepKeyRef = useRef('')
  
  // Preload sound assets và set audio mode khi component mount (chỉ mobile)
  useEffect(() => {
    if (Platform.OS === 'web') return
    if (!ExpoAudioMode) return
    
    const setupAudio = async () => {
      try {
        // Set audio mode trước
        await ExpoAudioMode.setAudioModeAsync({
          playsInSilentModeIOS: true,
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        })
        
        // Preload sound assets nếu có Asset và sound files
        if (Asset && CorrectSfx && WrongSfx) {
          try {
            const correctAsset = Asset.fromModule(CorrectSfx)
            const wrongAsset = Asset.fromModule(WrongSfx)
            
            if (!correctAsset.downloaded) {
              await correctAsset.downloadAsync()
            }
            if (!wrongAsset.downloaded) {
              await wrongAsset.downloadAsync()
            }
          } catch (preloadErr) {
          }
        }
      } catch (e) {
        // Failed to set audio mode
      }
    }
    
    setupAudio()
  }, [])
  
  useEffect(() => {
    if (Platform.OS === 'web') return
    if (!showResult) {
      // Reset khi không show result để cho phép phát lại khi show result
      lastSfxKeyRef.current = ''
      return
    }
    // Chỉ phát sound ở bước 2 (listen) và bước 3 (meaning)
    if (currentStepKey !== 'listen' && currentStepKey !== 'meaning') return

    const vocabId = current?.id || ''
    const sfxKey = `${vocabId}:${currentStepKey}:${isCorrect ? 'correct' : 'wrong'}`
    
    // Reset key nếu step key hoặc isCorrect thay đổi (cho phép phát lại khi chuyển từ wrong sang correct hoặc ngược lại)
    if (lastStepKeyRef.current !== currentStepKey || lastIsCorrectRef.current !== isCorrect) {
      lastSfxKeyRef.current = ''
      lastStepKeyRef.current = currentStepKey
      lastIsCorrectRef.current = isCorrect
    }
    
    if (lastSfxKeyRef.current === sfxKey) {
      return
    }
    lastSfxKeyRef.current = sfxKey

    const playSoundEffect = async () => {
      try {
        const src = isCorrect ? CorrectSfx : WrongSfx
        
        // Kiểm tra xem sound file có tồn tại không
        if (!src) {
          return
        }
        
        
        if (Platform.OS === 'web') {
          // Web: sử dụng HTML5 Audio
          const audioSrc = typeof src === 'string' 
            ? src 
            : (src?.default || src?.src || src)
          const audio = typeof window !== 'undefined' && window.Audio ? new window.Audio(audioSrc) : null
          if (audio) {
            audio.volume = 1
            audio.play().catch((err) => {
            })
          } else {
          }
        } else {
          // Mobile: sử dụng expo-av
          if (!ExpoAudio) {
            return
          }
          
          // Normalize sound source - có thể là require() (number), string, hoặc object
          // Trong React Native với expo-av, require() cho local files trả về number (module ID)
          // Cần sử dụng Asset.fromModule() để resolve thành URI thực tế
          let soundSource = null
          
          if (typeof src === 'number') {
            // require() trả về number (module ID)
            // Sử dụng Asset.fromModule() để resolve thành URI nếu có Asset
            if (Asset) {
              try {
                const asset = Asset.fromModule(src)
                // Đảm bảo asset đã được download
                if (!asset.downloaded) {
                  await asset.downloadAsync()
                }
                soundSource = { uri: asset.localUri || asset.uri }
              } catch (assetErr) {
                // Fallback: thử dùng number trực tiếp
                soundSource = src
              }
            } else {
              // Không có Asset, thử dùng number trực tiếp
              soundSource = src
            }
          } else if (typeof src === 'string') {
            // String URL - có thể là local file path hoặc remote URL
            // Metro bundler không hỗ trợ dynamic require(), nên dùng trực tiếp làm URI
            soundSource = { uri: src }
          } else if (src && typeof src === 'object') {
            // Object có thể có default, src, hoặc uri
            if (src.default !== undefined) {
              const defaultSrc = src.default
              if (typeof defaultSrc === 'number') {
                soundSource = defaultSrc
              } else if (typeof defaultSrc === 'string') {
                soundSource = { uri: defaultSrc }
              } else {
                soundSource = defaultSrc
              }
            } else if (src.src !== undefined) {
              soundSource = typeof src.src === 'string' ? { uri: src.src } : src.src
            } else if (src.uri !== undefined) {
              soundSource = { uri: src.uri }
            } else {
              // Thử dùng object trực tiếp nếu có thể
              soundSource = src
            }
          }
          
          if (soundSource === null || soundSource === undefined) {
            return
          }
          
          
          try {
            const { sound } = await ExpoAudio.Sound.createAsync(
              soundSource,
              { 
                shouldPlay: true, 
                volume: 1.0,
                isMuted: false,
              }
            )
            
            // Kiểm tra status ngay sau khi tạo
            const initialStatus = await sound.getStatusAsync()
            
            if (initialStatus.error) {
              await sound.unloadAsync()
              return
            }
            
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded) {
                if (status.didJustFinish) {
                  sound.unloadAsync().catch(() => {
                    // Error unloading sound
                  })
                } else if (status.error) {
                  // Playback error
                } else if (status.isPlaying) {
                }
              } else if (status.error) {
                // Sound load error
              }
            })
            
            // Đảm bảo sound được play - kiểm tra lại sau một chút
            setTimeout(async () => {
              try {
                const status = await sound.getStatusAsync()
                if (status.isLoaded && !status.isPlaying && !status.error) {
                  await sound.playAsync()
                }
              } catch (playErr) {
                // Error ensuring sound plays
              }
            }, 100)
          } catch (createErr) {
            // Thử lại với cách khác nếu là number
            if (typeof soundSource === 'number' && Asset) {
              try {
                const asset = Asset.fromModule(soundSource)
                if (!asset.downloaded) {
                  await asset.downloadAsync()
                }
                const retrySource = { uri: asset.localUri || asset.uri }
                const { sound } = await ExpoAudio.Sound.createAsync(
                  retrySource,
                  { shouldPlay: true, volume: 1.0, isMuted: false }
                )
              } catch (retryErr) {
                // Retry also failed
              }
            }
          }
        }
      } catch (e) {
        // Error playing sound effect
      }
    }

    playSoundEffect()
  }, [showResult, currentStepKey, isCorrect, current?.id])

  const iconScale = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (showResult) {
      iconScale.setValue(0)
      Animated.spring(iconScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 40,
        friction: 4,
      }).start()
    }
  }, [showResult])
  
  const animatedProgress = useRef(new Animated.Value(progress)).current
  useEffect(() => {
    Animated.spring(animatedProgress, {
      toValue: progress,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start()
  }, [progress])

  const progressWidth = animatedProgress.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  })

  // Helper function để kiểm tra xem icon có phải là React component không (SVG component)
  const isReactComponent = (icon) => {
    if (!icon) return false
    return (
      (typeof icon === 'function') || 
      (typeof icon === 'object' && icon.$$typeof) ||
      (typeof icon === 'object' && icon.default && (typeof icon.default === 'function' || icon.default.$$typeof))
    )
  }

  // Helper function để render SoundIcon - hỗ trợ cả React component (SVG) và Image source
  // Tương tự như cách navbar-mobile.jsx xử lý SVG icons
  // Helper function để render icon kết quả
  const renderResultIcon = (iconSource, size = 64, color) => {
    if (!iconSource) return null
    try {
      if (typeof iconSource === 'function') {
        const IconComponent = iconSource
        return <IconComponent width={size} height={size} fill={color} />
      }
      if (iconSource && typeof iconSource === 'object' && iconSource.default) {
        if (typeof iconSource.default === 'function') {
          const IconComponent = iconSource.default
          return <IconComponent width={size} height={size} fill={color} />
        }
      }
    } catch (e) {}

    const source = normalizeImageSource(iconSource)
    return <Image source={source} style={{ width: size, height: size }} tintColor={color} />
  }

  const renderStep = () => {
    if (!current) return null
    if (currentStepKey === 'view') {
      return (
        <View style={styles.flipCardWrapper}>
          <FlipCardMobile
            frontContent={
              <View style={styles.flipFront}>
                <Text style={styles.flipWord}>{current.word || ''}</Text>
                {current.pronunciation ? (
                  <Text style={styles.flipPronun}>{current.pronunciation}</Text>
                ) : null}
              </View>
            }
            backContent={
              <View style={styles.flipBack}>
                {current.imageUrl ? (
                  <Image
                    source={normalizeImageSource(current.imageUrl)}
                    style={styles.flipImage}
                    resizeMode="cover"
                  />
                ) : null}
                <Text style={styles.flipMeaning}>{current.meaning || ''}</Text>
              </View>
            }
            width="100%"
            height={Dimensions.get('window').height * 0.6}
            frontColor="#79964E"
            backColor="#79964E"
            borderWidth={12}
            borderRadius={12}
            isFlipped={isFlipped}
            onFlip={onFlip}
            onPlaySound={current?.audioUrl ? onPlaySound : undefined}
          />
          <Text style={styles.cardHint}>Bấm vào thẻ để lật, sau đó bấm Tiếp tục</Text>
        </View>
      )
    }

    if (!showResult) {
      return (
        <View style={styles.practiceBox}>
          <Text style={styles.stepTitle}>
            {currentStepKey === 'listen' ? 'Nghe và viết lại' : 'Nhìn nghĩa và viết từ'}
          </Text>
          {currentStepKey === 'listen' ? (
            <View style={styles.audioRow}>
              <TouchableOpacity style={styles.audioButton} onPress={onPlaySound}>
                {renderSoundIcon(32)}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.meaningBox}>
              <Text style={styles.meaningText}>{current.meaning}</Text>
            </View>
          )}

          <TextInput
            style={styles.answerInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder={currentStepKey === 'listen' ? 'Gõ lại từ bạn nghe được' : 'Nhập từ tiếng Anh'}
            placeholderTextColor="#999"
            onSubmitEditing={onSubmit}
          />
          <TouchableOpacity
            style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
            onPress={onSubmit}
            disabled={!userAnswer.trim()}
          >
            <Text style={styles.submitText}>Kiểm tra</Text>
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <View
        style={[
          styles.resultBox,
          isCorrect ? styles.resultBoxCorrect : styles.resultBoxWrong,
        ]}
      >
        <Animated.View style={[styles.resultIconWrapper, { transform: [{ scale: iconScale }] }]}>
          {renderResultIcon(isCorrect ? CorrectIcon : WarnIcon, 64, isCorrect ? '#23ac38' : '#eb5757')}
        </Animated.View>

        {current.imageUrl ? (
          <Image source={normalizeImageSource(current.imageUrl)} style={styles.cardImage} resizeMode="cover" />
        ) : null}
        <View style={styles.resultContent}>
          <View style={styles.resultHeader}>
            {current?.audioUrl && onPlaySound ? (
              <TouchableOpacity 
                style={styles.audioButtonSmall} 
                onPress={() => {
                  if (onPlaySound) {
                    onPlaySound()
                  }
                }}
              >
                {renderResultIcon(SoundIcon, 24, '#1F1F1F')}
              </TouchableOpacity>
            ) : null}
            <Text style={styles.cardWord}>
              {current.word}
            </Text>
          </View>
          {current.pronunciation ? (
            <Text style={styles.cardPronun}>
              {current.pronunciation}
            </Text>
          ) : null}
          <Text style={styles.cardMeaning}>
            {current.meaning}
          </Text>
          {!isCorrect ? (
            <View style={styles.wrongBox}>
              <Text style={styles.wrongLabel}>Đáp án của bạn:</Text>
              <Text style={styles.wrongText}>{userAnswer}</Text>
            </View>
          ) : null}
        </View>
      </View>
    )
  }

  if (loading) {
    return (
      <LoadingWithContainer
        size={48}
        color="#F1BE4B"
        shadowColor="#F1BE4B50"
        text="Đang tải từ vựng..."
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
      />
    )
  }

  if (error && (!current || total === 0)) {
    return (
      <>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </>
    )
  }

  if (!current) {
    // Hiển thị thông báo khi đã học hết từ vựng
    if (allWordsCompleted) {
      return (
        <>
          <View style={styles.headerTop}>
            <NavigationPill
              label="Quay lại"
              icon={ArrowIcon}
              iconStyle={{ transform: [{ scaleX: -1 }] }}
              onPress={onBackPress}
              textStyle={{ fontWeight: '700' }}
            />
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.completedText}>Bạn đã học hết từ vựng!</Text>
            <Text style={styles.completedSubtext}>Đang chuyển về danh sách từ vựng...</Text>
          </View>
        </>
      )
    }
    
    return (
      <>
        <View style={styles.headerTop}>
          <NavigationPill
            label="Quay lại"
            icon={ArrowIcon}
            iconStyle={{ transform: [{ scaleX: -1 }] }}
            onPress={onBackPress}
            textStyle={{ fontWeight: '700' }}
          />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có từ vựng nào</Text>
        </View>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerTop}>
        <NavigationPill
          label="Quay lại"
          icon={ArrowIcon}
          iconStyle={{ transform: [{ scaleX: -1 }] }}
          onPress={onBackPress}
          textStyle={{ fontWeight: '700' }}
        />
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.stepContainer}>
        {renderStep()}
      </View>

      {(currentStepKey === 'view' || showResult) && (
        <TouchableOpacity
          style={[styles.nextButton, !canContinue && styles.nextButtonDisabled]}
          onPress={onContinue}
          disabled={!canContinue}
        >
          <Text style={styles.nextText}>
            {currentStepKey === 'meaning' && showResult && currentIndex + 1 === total ? 'Hoàn thành' : 'Tiếp tục'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Dialog tiếp tục học */}
      <Modal
        visible={showContinueDialog}
        transparent={true}
        animationType="fade"
        onRequestClose={onStopLearning}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {hasMoreFlashcards 
                ? `Bạn đã học xong ${completedInBatch} từ!` 
                : 'Bạn đã học hết từ vựng!'}
            </Text>
            <Text style={styles.modalMessage}>
              {hasMoreFlashcards
                ? 'Bạn có muốn tiếp tục học thêm từ vựng không?'
                : 'Chúc mừng! Bạn đã hoàn thành tất cả từ vựng trong chủ đề này.'}
            </Text>
            <View style={styles.modalButtons}>
              {hasMoreFlashcards && (
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={onContinueLearning}
                >
                  <Text style={styles.modalButtonText}>Tiếp tục học</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={onStopLearning}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                  {hasMoreFlashcards ? 'Dừng lại' : 'Quay lại'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleRow: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...studyStyles.pageTitle,
    textAlign: 'center',
  },
  stepContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minHeight: 0,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  progressBarContainer: {
    width: '100%',
    paddingHorizontal: 16,
  },
  progressBar: {
    width: '100%',
    height: 15,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#833ab4',
    // Gradient sẽ áp dụng trên web, native sẽ fallback màu đầu tiên
    backgroundImage: 'linear-gradient(to right, #833ab4, #fd1d1d, #fcb045)',
    borderRadius: 999,
  },
  flipCardWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 20,
  },
  flipFront: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  flipWord: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  flipPronun: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  flipBack: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
  },
  flipImage: {
    width: '100%',
    height: 260,
    borderRadius: 8,
  },
  flipMeaning: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cardBox: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F1BE4B',
  },
  cardImage: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#F5F5F5' },
  cardWord: { fontSize: 24, fontWeight: '800', color: '#1F1F1F', textTransform: 'capitalize' },
  cardPronun: { fontSize: 15, color: '#666', fontStyle: 'italic' },
  cardMeaning: { fontSize: 16, color: '#1F1F1F', textAlign: 'center' },
  cardHint: { 
    fontSize: 12, 
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  practiceBox: {
    width: '100%',
    height: 360,
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  stepTitle: { fontSize: 20, fontWeight: '800', color: '#1F1F1F' },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIcon: {
    width: 32,
    height: 32,
    tintColor: '#1F1F1F',
  },
  meaningBox: {
    width: '100%',
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  meaningText: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: '#1F1F1F' },
  answerInput: {
    width: '100%',
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    fontSize: 15,
  },
  submitButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F1BE4B',
  },
  submitButtonDisabled: { opacity: 0.6 },
  submitText: { fontSize: 15, fontWeight: '800', color: '#1F1F1F' },
  resultBox: {
    width: '100%',
    height: 480, // Tăng chiều cao một chút để icon không bị chen chúc
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
  },
  resultBoxCorrect: { borderColor: '#23ac38' },
  resultBoxWrong: { borderColor: '#eb5757' },
  resultIconWrapper: {
    marginBottom: 6,
  },
  resultBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  resultCorrect: { backgroundColor: '#23ac38' },
  resultWrong: { backgroundColor: '#eb5757' },
  resultBadgeText: { fontSize: 14, fontWeight: '800', color: '#1F1F1F' },
  resultContent: { width: '100%', gap: 6, alignItems: 'center' },
  resultHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wrongBox: {
    width: '100%',
    marginTop: 6,
    padding: 10,
    backgroundColor: '#FDECEA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eb5757',
  },
  wrongLabel: { fontSize: 12, fontWeight: '700', color: '#eb5757' },
  wrongText: { fontSize: 15, fontWeight: '700', color: '#eb5757' },
  nextButton: {
    marginTop: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
    alignSelf: 'center',
    minWidth: 200,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  audioButtonSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioIconSmall: {
    width: 24,
    height: 24,
    tintColor: '#1F1F1F',
  },
  resultTextOnColor: {
    color: '#FFFFFF',
  },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  errorText: { fontSize: 16, color: '#C62828', textAlign: 'center' },
  retryButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: '#F1BE4B' },
  retryText: { fontSize: 14, fontWeight: '700', color: '#1F1F1F' },
  emptyContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: '#666' },
  completedText: { fontSize: 22, fontWeight: '800', color: '#4CAF50', marginBottom: 12 },
  completedSubtext: { fontSize: 15, color: '#666' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#4CAF50',
  },
  modalButtonSecondary: {
    backgroundColor: '#E0E0E0',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalButtonTextSecondary: {
    color: '#1F1F1F',
  },
})


