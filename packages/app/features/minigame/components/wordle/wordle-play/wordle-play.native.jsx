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

import BackgroundImage from '../../../../../../assets/BackgroundSolite.jpg'
import MenuIcon from '../../../../../../assets/menu-solitare.png'
import TitleBadge from '../../../../../../assets/TitleBadge.png'
import ButtonWood from '../../../../../../assets/ButtonWood.png'
import ArrowIcon from '../../../../../../assets/icon/icon-mainflow/arrow.svg'

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
            <View style={styles.headerLeft}>
              <Pressable onPress={handleQuit} style={styles.backButtonContainer}>
                <Image source={ButtonWood} style={styles.backButtonBg} />
                <View style={styles.backButtonContent}>
                  <ArrowIcon width={16} height={16} fill="#FFD700" />
                  <Text style={styles.backButtonText}>Quay lại</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.titleWrapper}>
              <Image source={TitleBadge} style={styles.bannerImage} />
              <Text style={styles.title}>Wordle</Text>
            </View>

            <View style={styles.headerRight} />
            {!!TOPIC_NAME && <Text style={styles.topic}>Chủ đề: {TOPIC_NAME}</Text>}
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

            {gameState !== 'won' && (
              <View style={styles.gridSection}>
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
            )}

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
    minHeight: 110,
    width: '100%',
  },
  headerLeft: {
    position: 'absolute',
    left: 14,
    top: 50,
    zIndex: 20,
  },
  headerRight: {
    width: 120, // To balance the left section
  },
  backButtonContainer: {
    width: 120,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  titleWrapper: {
    width: 200,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bannerImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  topic: {
    marginTop: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#5D4037',
    position: 'absolute',
    bottom: -15,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
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