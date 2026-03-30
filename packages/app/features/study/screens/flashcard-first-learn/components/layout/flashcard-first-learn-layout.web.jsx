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
      title="Học từ mới"
      subtitle="Tiếp cận những từ vựng mới một cách dễ dàng và hiệu quả."
      breadcrumbActive="Học mới"
    >
      {children}
    </StudyLayoutSynchronized>
  )
}


