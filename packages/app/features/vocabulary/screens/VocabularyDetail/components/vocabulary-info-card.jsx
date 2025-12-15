'use client'

import React from 'react'
import { Card, Descriptions } from 'antd'

export function VocabularyInfoCard({ vocab }) {
  if (!vocab) return null

  return (
    <Card>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Từ">{vocab.text || '-'}</Descriptions.Item>
        <Descriptions.Item label="Phiên âm">{vocab.pronunciation || '-'}</Descriptions.Item>
        <Descriptions.Item label="Định nghĩa">{vocab.definition || '-'}</Descriptions.Item>
        <Descriptions.Item label="Câu ví dụ">{vocab.exampleSentence || '-'}</Descriptions.Item>
        <Descriptions.Item label="Ảnh minh họa">{vocab.imgURL || '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  )
}

export default VocabularyInfoCard

