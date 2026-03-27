import React from 'react'
import { Pressable, Text, StyleSheet, Platform } from 'react-native'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import BookIcon from 'assets/icon/navigate-app/book.svg'

/**
 * FlashcardListLayout (Web): Layout cho trang danh sách flashcard trên web
 */
export function FlashcardListLayout({
  children,
  levelId,
  onBackPress,
  onFavoritesPress,
  onLearnedPress,
}) {
  const headerActions = (
    <>
      {onFavoritesPress && (
        <Pressable style={styles.actionButton} onPress={onFavoritesPress}>
          <StudyIcon
            source={StarIcon}
            width={20}
            height={20}
            tintColor="#F1BE4B"
          />
          <Text style={styles.actionText}>Từ vựng yêu thích</Text>
        </Pressable>
      )}
      {onLearnedPress && (
        <Pressable style={styles.actionButton} onPress={onLearnedPress}>
          <StudyIcon
            source={BookIcon}
            width={20}
            height={20}
            tintColor="#F1BE4B"
          />
          <Text style={styles.actionText}>Ôn tập từ vựng</Text>
        </Pressable>
      )}
    </>
  )

  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      title="Flashcard học tập"
      breadcrumbActive="Flashcard"
      headerActions={headerActions}
    >
      {children}
    </StudyLayoutSynchronized>
  )
}

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    marginLeft: 12,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transition: 'all 0.2s ease',
    }),
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#F1BE4B',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
})

