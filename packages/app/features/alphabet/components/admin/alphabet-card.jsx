'use client'

import React from 'react'
import { Card, Tag } from 'antd'

export default function AlphabetCard({ item, onEdit }) {
  return (
    <Card
      hoverable
      style={{ borderRadius: 12, border: '1px solid #f0f0f0', height: '100%' }}
      styles={{ body: { padding: 12, textAlign: 'center' } }}
      onClick={() => onEdit(item)}
    >
      <div style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 8, color: '#1677ff' }}>{item.letter}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.meaning}</div>
      <div style={{ fontSize: 12, color: '#8c8c8c' }}>{item.pronunciation}</div>
      <div style={{ marginTop: 8 }}>
        <Tag color={item.type === 'Vowel' ? 'volcano' : 'geekblue'}>
          {item.type === 'Vowel' ? 'Nguyên âm' : 'Phụ âm'}
        </Tag>
        {item.totalStrokes !== undefined && (
          <Tag color="green">{item.totalStrokes} nét</Tag>
        )}
      </div>
    </Card>
  )
}
