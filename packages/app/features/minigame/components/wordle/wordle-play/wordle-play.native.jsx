import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native'

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

  const renderWordInfo = gameState === 'won' && wordResult

  return (
    <ImageBackground source={BackgroundImage} style={styles.container} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <Text style={styles.title}>Wordle</Text>
            {!!TOPIC_NAME && <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>}

            <Pressable style={styles.menuBtn} onPress={handleMenuClick}>
              <Image source={MenuIcon} style={styles.menuIcon} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {renderWordInfo && (
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

            <View style={styles.gameSection}>
              <View style={styles.gridScaleWrap}>
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

              {gameState === 'playing' && (
                <View style={styles.keyboardWrap}>
                  <WordleKeyboard rows={rows} onKeyPress={handleVirtualKey} compact />
                </View>
              )}
            </View>

            <View style={styles.sentenceFlowWrap}>
              <WordleSentenceFlow
                gameState={gameState}
                dailyWordleId={props.dailyWordleId}
                onNavigateToBoard={handleNavigateToBoard}
                onRestart={handleRestart}
              />
            </View>
          </ScrollView>
        </View>

        {showMenuPopup && <WordleMenuPopup onContinue={handleContinue} onQuit={handleQuit} />}
      </SafeAreaView>
    </ImageBackground>
  )
}

export default WordlePlayNative

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 14,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3A2A1A',
  },
  topic: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#5D4037',
  },
  menuBtn: {
    position: 'absolute',
    right: 12,
    top: 40,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  gameSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  gridScaleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ scale: 0.88 }],
    marginTop: -20,
    marginBottom: -30,
  },
  keyboardWrap: {
    width: '130%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 2,
    transform: [{ scale: 0.80 }],
  },
  sentenceFlowWrap: {
    width: '100%',
    marginTop: 6,
    paddingBottom: 4,
  },
  wordInfoCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  wordInfoWord: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 6,
  },
  wordInfoDefinition: {
    fontSize: 14,
    color: '#3E2723',
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  wordInfoImage: {
    width: '100%',
    height: 140,
    marginBottom: 8,
  },
  audioButton: {
    alignSelf: 'center',
    backgroundColor: '#6AAA64',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
})