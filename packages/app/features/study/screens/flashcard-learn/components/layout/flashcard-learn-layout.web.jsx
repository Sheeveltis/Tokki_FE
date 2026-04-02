import React from 'react'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'

/**
 * FlashcardLearnLayout (Web): Layout cho trang học flashcard trên web
 */
export function FlashcardLearnLayout({ children, levelId, onBackPress }) {
  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      title="Luyện tập Flashcard"
      subtitle="Ghi nhớ từ vựng hiệu quả qua phương pháp lặp lại ngắt quãng (Spaced Repetition)."
      breadcrumbActive="Luyện tập"
    >
      {children}
    </StudyLayoutSynchronized>
  )
}

