import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native'

/**
 * FlashcardVocabularyList: Hiển thị danh sách các từ vựng trong chủ đề
 */
export function FlashcardVocabularyList({
  flashcards = [],
  currentIndex = 0,
  favorites = new Set(),
  onSelectFlashcard,
  onToggleFavorite,
}) {
  const [hoveredIndex, setHoveredIndex] = useState(null)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Danh sách từ vựng</Text>
        <Text style={styles.countText}>{flashcards.length} từ</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {flashcards.map((flashcard, index) => {
          const isActive = index === currentIndex
          const isFavorite = favorites.has(index)

          return (
            <Pressable
              key={index}
              onPress={() => onSelectFlashcard?.(index)}
              onHoverIn={() => Platform.OS === 'web' && setHoveredIndex(index)}
              onHoverOut={() => Platform.OS === 'web' && setHoveredIndex(null)}
              style={({ pressed }) => [
                styles.vocabItem,
                isActive && styles.vocabItemActive,
                (pressed || hoveredIndex === index) && styles.vocabItemHovered,
              ]}
            >
              <View style={styles.vocabContent}>
                <View style={styles.vocabText}>
                  <Text style={[styles.word, isActive && styles.wordActive]}>
                    {flashcard.word}
                  </Text>
                  <Text style={[styles.meaning, isActive && styles.meaningActive]}>
                    {flashcard.meaning}
                  </Text>
                </View>
                {isFavorite && (
                  <View style={styles.favoriteBadge}>
                    <Text style={styles.favoriteText}>★</Text>
                  </View>
                )}
              </View>
              {isActive && <View style={styles.activeIndicator} />}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#F4B8AF',
    overflow: 'hidden',
    maxHeight: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F0DD',
    borderBottomWidth: 2,
    borderBottomColor: '#F4B8AF',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  scrollView: {
    maxHeight: 350,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  vocabItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    position: 'relative',
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transitionProperty: 'background-color',
      transitionDuration: '150ms',
    }),
  },
  vocabItemActive: {
    backgroundColor: '#FFF4E6',
  },
  vocabItemHovered: {
    backgroundColor: '#FDF5E6',
  },
  vocabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vocabText: {
    flex: 1,
    gap: 4,
  },
  word: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F1F1F',
    fontFamily: 'Epilogue, sans-serif',
  },
  wordActive: {
    color: '#F1BE4B',
  },
  meaning: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    fontFamily: 'Epilogue, sans-serif',
  },
  meaningActive: {
    color: '#333',
    fontWeight: '600',
  },
  favoriteBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1BE4B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  favoriteText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F1BE4B',
  },
})

