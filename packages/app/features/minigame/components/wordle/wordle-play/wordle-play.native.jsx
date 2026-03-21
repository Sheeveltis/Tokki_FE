import React from 'react'
import { View, Text, StyleSheet, Image, ImageBackground, Pressable } from 'react-native'

import { WordleGrid } from './components/WordleGrid'
import { WordleKeyboard } from './components/WordleKeyboard'
import { WordleSentenceFlow } from './components/WordleSentenceFlow'
import { WordleMenuPopup } from './components/WordleMenuPopup'
import { useWordlePlayControl } from './useWordlePlayControl'

import BackgroundImage from '../../../../../../assets/BackgroundSolite.png'
import MenuIcon from '../../../../../../assets/menu-solitare.png'

export function WordlePlayNative(props) {
  const {
    WORD_LENGTH,
    MAX_GUESSES,
    TOPIC_NAME,
    rows,
    gameState,
    targetWord,
    showMenuPopup,
    wordResult,
    gridCells,
    activeColIndex,
    handleVirtualKey,
    handleCellClick,
    handleMenuClick,
    handleContinue,
    handleQuit,
    handleRestart,
    handleNavigateToBoard,
    handlePlayWordAudio,
  } = useWordlePlayControl(props)

  return (
    <ImageBackground source={BackgroundImage} style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.title}>Wordle</Text>
          <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>

          <Pressable style={styles.menuBtn} onPress={handleMenuClick}>
            <Image source={MenuIcon} style={styles.menuIcon} />
          </Pressable>
        </View>

        <View style={styles.content}>
          {gameState === 'won' && wordResult && (
            <View style={styles.wordInfoCard}>
              <Text style={styles.wordInfoWord}>{wordResult.word || targetWord}</Text>

              {!!wordResult.definition && (
                <Text style={styles.wordInfoDefinition}>{wordResult.definition}</Text>
              )}

              {!!wordResult.imageUrl && (
                <Image
                  source={{ uri: wordResult.imageUrl }}
                  style={styles.wordInfoImage}
                  resizeMode="contain"
                />
              )}

              {!!wordResult.audioUrl && (
                <Pressable style={styles.audioButton} onPress={handlePlayWordAudio}>
                  <Text style={styles.audioButtonText}>🔊 Nghe phát âm</Text>
                </Pressable>
              )}
            </View>
          )}

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

          {gameState === 'playing' && (
            <View style={styles.keyboardContainer}>
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

      {showMenuPopup && <WordleMenuPopup onContinue={handleContinue} onQuit={handleQuit} />}
    </ImageBackground>
  )
}

export default WordlePlayNative

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.35)' },
  header: {
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#3A2A1A',
  },
  topic: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  menuBtn: {
    position: 'absolute',
    right: 20,
    top: 18,
  },
  menuIcon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  keyboardContainer: {
    marginTop: 18,
  },
  wordInfoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  wordInfoWord: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  wordInfoDefinition: {
    fontSize: 15,
    color: '#3E2723',
    lineHeight: 22,
    marginBottom: 10,
  },
  wordInfoImage: {
    width: '100%',
    height: 180,
    marginBottom: 10,
  },
  audioButton: {
    alignSelf: 'center',
    backgroundColor: '#6AAA64',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
})