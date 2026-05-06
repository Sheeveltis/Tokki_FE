'use client'

import React, { useState } from 'react'
import { WordleVocabularyList } from '../components/WordleVocabularyList'
import WordleVocabularyDetailView from '../components/WordleVocabularyDetailView'

export function WordleVocabularyManagementScreen() {
  const [view, setView] = useState('list') // 'list' | 'detail'
  const [selectedRecord, setSelectedRecord] = useState(null)

  const handleOpenDetail = (record) => {
    setSelectedRecord(record)
    setView('detail')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedRecord(null)
  }

  if (view === 'detail') {
    return <WordleVocabularyDetailView record={selectedRecord} onBack={handleBackToList} />
  }

  return <WordleVocabularyList onOpenDetail={handleOpenDetail} />
}

export default WordleVocabularyManagementScreen
