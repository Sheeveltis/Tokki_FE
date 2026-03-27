import React from 'react'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'

/**
 * FlashcardTestLayout (Web): Layout cho trang test flashcard trên web
 */
export function FlashcardTestLayout({ 
  children,
  levelId,
  onBackPress
}) {
  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      title="Kiểm tra từ vựng"
      subtitle="Đánh giá khả năng ghi nhớ của bạn thông qua các bài test đa dạng."
      breadcrumbActive="Kiểm tra"
    >
      {children}
    </StudyLayoutSynchronized>
  )
}

