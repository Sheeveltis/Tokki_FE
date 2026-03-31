import React from 'react'
import { StudyLayoutSynchronized } from '@tokki/app/features/study/components/study-layout-synchronized.web'

/**
 * LearnedVocabularyPracticeLayout (Web): Layout cho trang practice từ vựng trên web
 */
export function LearnedVocabularyPracticeLayout({ children, levelId, onBackPress }) {
  return (
    <StudyLayoutSynchronized
      levelId={levelId || 1}
      onBackPress={onBackPress}
      title="Ôn tập từ vựng"
      subtitle="Thử thách khả năng ghi nhớ của bạn với các từ vựng đã học."
      breadcrumbActive="Ôn tập"
    >
      {children}
    </StudyLayoutSynchronized>
  )
}

