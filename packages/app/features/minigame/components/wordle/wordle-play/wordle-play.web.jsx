import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Platform } from 'react-native'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { VolumeControl } from './components/VolumeControl'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { HowToPlayTour } from './components/HowToPlayTour'
import { useWordlePlayControl } from './useWordlePlayControl'

import BackgroundImage from '../../../../../../assets/BackgroundTokki.png'
import TitleBadge from '../../../../../../assets/BannerWordle.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import BackgroundColumn from '../../../../../../assets/BackgroundColumn.png'
import ButtonWood from '../../../../../../assets/ButtonWood.png'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'
import HomeIcon from '../../../../../../assets/icon/navigate-app/home.svg'

export function WordlePlayWeb(props) {
  const {
    WORD_LENGTH,
    MAX_GUESSES,
    LEVEL,
    rows,
    gameState,
    targetWord,
    showMenuPopup,
    wordResult,
    tourRun,
    gridCells,
    activeColIndex,
    hiddenImeInputProps,
    setTourRun,
    handleVirtualKey,
    handleCellClick,
    handleMenuClick,
    handleContinue,
    handleQuit,
    handleHowToPlay,
    handleRestart,
    handleNavigateToBoard,
    handlePlayWordAudio,
    handleGoHome,
  } = useWordlePlayControl(props)
  const [isFlowFinished, setIsFlowFinished] = useState(false)

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return

    const prevBodyOverflow = document.body.style.overflow
    const prevHtmlOverflow = document.documentElement.style.overflow
    const prevBodyScrollbarGutter = document.body.style.scrollbarGutter
    const prevHtmlScrollbarGutter = document.documentElement.style.scrollbarGutter

    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    document.body.style.scrollbarGutter = 'auto'
    document.documentElement.style.scrollbarGutter = 'auto'

    return () => {
      document.body.style.overflow = prevBodyOverflow
      document.documentElement.style.overflow = prevHtmlOverflow
      document.body.style.scrollbarGutter = prevBodyScrollbarGutter
      document.documentElement.style.scrollbarGutter = prevHtmlScrollbarGutter
    }
  }, [])

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.header,
            gameState !== 'playing' && { zIndex: 1 },
          ]}
        >
          <View style={styles.headerLeft}>
            {!isFlowFinished ? (
              <Pressable onPress={handleQuit} style={styles.backButtonContainer}>
                <Image source={ButtonWood} style={styles.backButtonBg} />
                <View style={styles.backButtonContent}>
                  <ArrowIcon width={18} height={18} fill="#FFF" />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </View>
              </Pressable>
            ) : (
              <Pressable
                onPress={handleGoHome}
                style={styles.backButtonContainer}
              >
                <Image source={ButtonWood} style={styles.backButtonBg} />
                <View style={styles.backButtonContent}>
                  <HomeIcon width={22} height={22} fill="#FFF" />
                  <Text style={styles.backButtonText}>Trang Chủ</Text>
                </View>
              </Pressable>
            )}
          </View>

          <View style={styles.titleWrapper}>
            <Image source={TitleBadge} style={styles.bannerImage} />
            <Text style={styles.titleText}>Wordle</Text>
          </View>

          <View style={styles.headerRight}>
            {gameState === 'playing' && (
              <Pressable onPress={handleMenuClick} style={styles.menuBtn} nativeID="tour-menu">
                <Image source={MenuIcon} style={styles.menuIcon} />
              </Pressable>
            )}
          </View>
        </View>

        {gameState === 'playing' && (
          <ImageBackground
            source={BackgroundColumn}
            nativeID="tour-controls-panel"
            style={[styles.controlsPanel]}
            imageStyle={[styles.controlsPanelImage]}
          >
            <VolumeControl />

            <Pressable
              style={styles.howToBtn}
              onPress={handleHowToPlay}
              nativeID="tour-how-to-btn"
            >
              <Text style={styles.howToText}>Cách chơi</Text>
            </Pressable>
          </ImageBackground>
        )}

        <View style={[styles.content, gameState !== 'playing' && { zIndex: 100 }]}>
          <View style={styles.gameLayout}>
            {gameState === 'won' && wordResult && (
              <View style={styles.wordInfoCard}>
                <View style={styles.wordInfoRow}>
                  <Text style={styles.wordInfoWord}>{wordResult.word || targetWord}</Text>
                  {!!wordResult.definition && (
                    <Text style={styles.wordInfoDefinition}>{wordResult.definition}</Text>
                  )}
                </View>

                {!!wordResult.imageUrl && (
                  <Image
                    source={{ uri: wordResult.imageUrl }}
                    style={styles.wordInfoImage}
                    resizeMode="contain"
                  />
                )}

                {!!wordResult.audioUrl && (
                  <Pressable style={styles.wordInfoAudioButton} onPress={handlePlayWordAudio}>
                    <Text style={styles.wordInfoAudioText}>🔊 Nghe phát âm</Text>
                  </Pressable>
                )}
              </View>
            )}

            {gameState !== 'won' && (
              <View nativeID="tour-grid" style={styles.gridContainer}>
                <WordleGrid
                  rows={gameState === 'won' ? [] : rows}
                  maxGuesses={gameState === 'won' ? 0 : MAX_GUESSES}
                  wordLength={WORD_LENGTH}
                  level={LEVEL}
                  targetWord={targetWord}
                  gridCells={gridCells}
                  gameState={gameState}
                  activeColIndex={activeColIndex}
                  onCellClick={handleCellClick}
                />
              </View>
            )}
          </View>

          {gameState === 'playing' && (
            <View nativeID="tour-keyboard" style={styles.keyboardContainer}>
              <WordleKeyboard rows={rows} onKeyPress={handleVirtualKey} />
            </View>
          )}

          <WordleSentenceFlow
            gameState={gameState}
            dailyWordleId={props.dailyWordleId}
            onRestart={handleRestart}
            onNavigateToBoard={handleNavigateToBoard}
            onFlowFinished={setIsFlowFinished}
          />
        </View>
      </View>

      <HowToPlayTour run={tourRun} setRun={setTourRun} />

      {Platform.OS === 'web' && hiddenImeInputProps && (
        <input
          {...hiddenImeInputProps}
          type="text"
          autoFocus
          style={styles.hiddenImeInput}
        />
      )}

      {showMenuPopup && (
        <WordleMenuPopup
          onContinue={handleContinue}
          onQuit={handleQuit}
          onHowToPlay={handleHowToPlay}
        />
      )}
    </ImageBackground>
  )
}

export default WordlePlayWeb

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  overlay: {
    minHeight: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 8,
    width: '100%',
    zIndex: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    zIndex: 20,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  backButtonContainer: {
    width: 130,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
    color: '#FFFFFF',
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'web' ? 'Epilogue, sans-serif' : undefined,
  },
  titleWrapper: {
    flex: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -55,
  },
  bannerImage: {
    width: 270,
    height: 150,
    resizeMode: 'contain',
    top: 15,
  },
  titleText: {
    position: 'absolute',
    top: '53%',
    fontSize: 24,
    fontWeight: '800',
    color: '#4e3e31ff',
    textShadowColor: 'rgba(139, 111, 111, 0.3)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 2,
    fontFamily: Platform.OS === 'web' ? 'Epilogue, sans-serif' : undefined,
  },
  controlsPanel: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 35,
    paddingHorizontal: 25,
    gap: 15,
    zIndex: 20,
  },
  controlsPanelImage: {
    resizeMode: 'stretch',
  },
  howToBtn: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  howToText: {
    fontWeight: '700',
    color: '#FFFFFF',
    fontSize: 14,
  },
  menuBtn: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 50,
    width: '100%',
  },
  gameLayout: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordInfoCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#4CAF50',
    marginTop: 20,
    position: 'relative',
  },
  wordInfoRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  wordInfoWord: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 4,
  },
  wordInfoDefinition: {
    fontSize: 18,
    color: '#3E2723',
    fontWeight: '600',
    textAlign: 'center',
  },
  wordInfoImage: {
    width: '100%',
    height: 180,
    marginBottom: 10,
  },
  wordInfoAudioButton: {
    alignSelf: 'center',
    backgroundColor: '#6AAA64',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  wordInfoAudioText: {
    color: '#fff',
    fontWeight: '700',
  },
  hiddenImeInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
    left: -9999,
    top: 0,
  },
})