import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, Platform, Image } from 'react-native'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import SoundIcon from 'assets/icon/icon-mainflow/sound.svg'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import DictionaryIcon from 'assets/icon/navigate-app/dictionary.svg'
import DefaultBunny from 'assets/bunny/14.png'

/**
 * VocabCard: Thành phần hiển thị từ vựng dưới dạng card
 */
const VocabCard = ({ 
  flashcard, 
  isFavorite, 
  onSelect,
  onPlaySound,
  onToggleFavorite
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const handlePlayAudio = (e) => {
    e.stopPropagation()
    if (flashcard.audioUrl) {
      const audio = new Audio(flashcard.audioUrl)
      audio.play()
    }
    // Cũng gọi handlePlaySound từ props nếu cần đồng bộ state
    onPlaySound?.()
  }

  return (
    <View
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={[
        styles.vocabCard,
        isHovered && styles.vocabCardHover
      ]}
    >
      <Pressable 
        onPress={onSelect}
        style={styles.cardPressable}
      >
        <View style={styles.vocabImageWrapper}>
          <Image
            source={flashcard.imageUrl ? { uri: flashcard.imageUrl } : DefaultBunny}
            style={styles.vocabImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.vocabInfo}>
          <View style={styles.vocabHeaderLine}>
            <Text style={styles.vocabWord}>{flashcard.word}</Text>
            <View style={styles.cardActions}>
              {flashcard.audioUrl && (
                <Pressable onPress={handlePlayAudio} style={styles.audioBtn}>
                  <StudyIcon source={SoundIcon} width={18} height={18} tintColor="#F1BE4B" />
                </Pressable>
              )}
              <Pressable 
                onPress={(e) => {
                  e.stopPropagation()
                  const url = `https://dict.naver.com/search.nhn?query=${encodeURIComponent(flashcard.word)}`
                  window.open(url, '_blank')
                }} 
                style={styles.dictionaryBtn}
              >
                <StudyIcon 
                  source={DictionaryIcon} 
                  width={18} 
                  height={18} 
                  tintColor="#F1BE4B" 
                />
              </Pressable>
              <Pressable 
                onPress={(e) => {
                  e.stopPropagation()
                  onToggleFavorite?.()
                }} 
                style={[styles.favoriteBtn, isFavorite && styles.favoriteBtnActive]}
              >
                <StudyIcon 
                  source={StarIcon} 
                  width={18} 
                  height={18} 
                  tintColor={isFavorite ? "#FFF" : "#F1BE4B"} 
                />
              </Pressable>
            </View>
          </View>

          {flashcard.pronunciation && (
            <Text style={styles.vocabPronunciation}>/{flashcard.pronunciation}/</Text>
          )}

          <Text style={styles.vocabMeaning} numberOfLines={2}>{flashcard.meaning}</Text>
        </View>
      </Pressable>
    </View>
  )
}

/**
 * FlashcardVocabularyList: Hiển thị danh sách các từ vựng dưới dạng lưới card
 */
export function FlashcardVocabularyList({
  flashcards = [],
  favorites = new Set(),
  onSelectFlashcard,
  onToggleFavorite,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Danh sách từ vựng</Text>
        <Text style={styles.countText}>{flashcards.length} từ</Text>
      </View>

      <View style={styles.listGrid}>
        {flashcards.map((flashcard, index) => (
          <VocabCard 
            key={index} 
            flashcard={flashcard} 
            isFavorite={favorites.has(index)}
            onSelect={() => onSelectFlashcard?.(index)}
            onToggleFavorite={() => onToggleFavorite?.(index)}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  listGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  vocabCard: {
    width: 'calc(33.333% - 14px)',
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
    ...(Platform.OS === 'web' && {
      transition: 'all 0.25s ease',
    }),
  },
  vocabCardHover: {
    transform: [{ translateY: -5 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    borderColor: '#F1BE4B50',
    ...(Platform.OS === 'web' && {
      boxShadow: '0 12px 30px rgba(0,0,0,0.06)',
    }),
  },
  cardPressable: {
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  vocabImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9F9F9',
  },
  vocabImage: {
    width: '100%',
    height: '100%',
  },
  vocabInfo: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  vocabHeaderLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  audioBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF9EB',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  dictionaryBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  favoriteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
  },
  favoriteBtnActive: {
    backgroundColor: '#F1BE4B',
    borderColor: '#F1BE4B',
  },
})


