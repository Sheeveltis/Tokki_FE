import React from 'react'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'

/**
 * LearnedVocabularyListLayout (Web): Layout cho trang danh sách từ vựng đã học trên web
 */
export function LearnedVocabularyListLayout({ 
  children,
  levelId,
  onBackPress
}) {
  return (
    <StudyLayoutSynchronized
      levelId={levelId}
      onBackPress={onBackPress}
      title="Từ vựng đã học"
      subtitle="Xem lại danh sách các từ vựng bạn đã ghi nhớ để củng cố kiến thức."
      breadcrumbActive="Đã học"
    >
      {children}
    </StudyLayoutSynchronized>
  )
}

