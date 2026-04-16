import { useEffect } from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Platform } from 'react-native'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { VolumeControl } from './components/VolumeControl'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { HowToPlayTour } from './components/HowToPlayTour'
import { useWordlePlayControl } from './useWordlePlayControl'

import BackgroundImage from '../../../../../../assets/BackgroundTokki.png'
import BannerSolitare from '../../../../../../assets/BannerSolitare.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import BackgroundColumn from '../../../../../../assets/BackgroundColumn.png'

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
  } = useWordlePlayControl(props)

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
        <View style={styles.header}>
          <View style={styles.headerSpacer} />

          <View style={styles.titleWrapper}>
            <Image source={BannerSolitare} style={styles.bannerImage} />
            <Text style={styles.titleText}>Wordle</Text>
          </View>

          <View style={styles.headerSpacer} />
        </View>

        <ImageBackground source={BackgroundColumn} style={styles.controlsPanel} imageStyle={styles.controlsPanelImage}>
          <VolumeControl />

          <Pressable style={styles.howToBtn} onPress={handleHowToPlay}>
            <Text style={styles.howToText}>Cách chơi</Text>
          </Pressable>

          <Pressable nativeID="tour-menu" style={styles.menuBtn} onPress={handleMenuClick}>
            <Image source={MenuIcon} style={styles.menuIcon} />
          </Pressable>
        </ImageBackground>

        <View style={styles.content}>
          <View style={styles.gameLayout}>
            {gameState === 'won' && wordResult && (
              <View style={styles.wordInfoCard}>
                <Text style={styles.wordInfoWord}>{wordResult.word || targetWord}</Text>

                {!!wordResult.definition && (
                  <>
                    <Text style={styles.wordInfoLabel}>Định nghĩa</Text>
                    <Text style={styles.wordInfoDefinition}>{wordResult.definition}</Text>
                  </>
                )}

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
          </View>

          {gameState === 'playing' && (
            <View nativeID="tour-keyboard" style={styles.keyboardContainer}>
              <WordleKeyboard rows={rows} onKeyPress={handleVirtualKey} />
            </View>
          )}

          <WordleSentenceFlow
            gameState={gameState}
            dailyWordleId={props.dailyWordleId}
            onNavigateToBoard={handleNavigateToBoard}
            onRestart={handleRestart}
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

      {showMenuPopup && <WordleMenuPopup onContinue={handleContinue} onQuit={handleQuit} />}
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
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
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
  titleWrapper: {
    flex: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -60,
  },
  bannerImage: {
    width: 270,
    height: 150,
    resizeMode: 'contain',
  },
  titleText: {
    position: 'absolute',
    top: '58%',
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
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
    justifyContent: 'flex-start',
    paddingTop: -10,
    paddingBottom: 50,
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
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  wordInfoWord: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  wordInfoLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6D4C41',
    marginBottom: 4,
  },
  wordInfoDefinition: {
    fontSize: 15,
    color: '#3E2723',
    marginBottom: 10,
    lineHeight: 22,
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