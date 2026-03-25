import React from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable, Platform } from 'react-native'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { VolumeControl } from './components/VolumeControl'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { HowToPlayTour } from './components/HowToPlayTour'
import { useWordlePlayControl } from './useWordlePlayControl'

import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'

export function WordlePlayWeb(props) {
  const {
    WORD_LENGTH,
    MAX_GUESSES,
    TOPIC_NAME,
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

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.volumeWrapper}>
            <VolumeControl />
          </View>

          <Text style={styles.title}>Wordle</Text>
          <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>

          <View style={styles.headerRightActions}>
            <Pressable style={styles.howToBtn} onPress={handleHowToPlay}>
              <Text style={styles.howToText}>Cách chơi</Text>
            </Pressable>

            <Pressable nativeID="tour-menu" style={styles.menuBtn} onPress={handleMenuClick}>
              <Image source={MenuIcon} style={styles.menuIcon} />
            </Pressable>
          </View>
        </View>

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
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  header: {
    paddingTop: 18,
    paddingHorizontal: 24,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeWrapper: {
    position: 'absolute',
    left: 24,
    top: 18,
    zIndex: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3A2A1A',
  },
  topic: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  headerRightActions: {
    position: 'absolute',
    right: 24,
    top: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  howToBtn: {
    backgroundColor: '#fff7ea',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  howToText: {
    fontWeight: '700',
    color: '#5D4037',
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
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