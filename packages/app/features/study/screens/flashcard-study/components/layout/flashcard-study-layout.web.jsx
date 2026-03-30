import React from 'react'
import { Pressable, Text, StyleSheet, Platform } from 'react-native'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'
import { StudyIcon } from '@tokki/app/features/study/components/study-icon.web'
import StarIcon from 'assets/icon/icon-mainflow/star.svg'
import BunnyTest from 'assets/bunny/15.png'

/**
 * FlashcardStudyLayout (Web): Layout cho trang học flashcard trên web
 */
export function FlashcardStudyLayout({ 
  children,
  levelId,
  onBackPress,
  onFavoritesPress,
  onTestPress,
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
      {onTestPress && (
        <Pressable style={styles.actionButton} onPress={onTestPress}>
          <StudyIcon
            source={BunnyTest}
            width={20}
            height={20}
          />
          <Text style={styles.actionText}>Ôn tập</Text>
        </Pressable>
      )}
    </>
  )

  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      title="Học Flashcard"
      subtitle="Luyện tập từ vựng thông qua các thẻ flashcard sinh động để ghi nhớ lâu hơn."
      breadcrumbActive="Luyện tập"
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
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    fontFamily: 'Epilogue, sans-serif',
  },
})

