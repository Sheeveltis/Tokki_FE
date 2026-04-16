import React from 'react'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'

/**
 * FlashcardFirstLearnLayout (Web): Layout cho trang học từ vựng lần đầu trên web
 */
export function FlashcardFirstLearnLayout({
  children,
  levelId,
  onBackPress
}) {
  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      breadcrumbActive="Học mới"
      hideHero={true}
      transparentContent={true}
      scrollable={false}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingVertical: 0,
        paddingHorizontal: 0,
      }}
    >
      {children}
    </StudyLayoutSynchronized>
  )
}


