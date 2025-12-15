'use client'

import React from 'react'
import { Space } from 'antd'
import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'

export function VocabularyFormActions({ loading, onCancel, onSubmit }) {
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
      <Space>
        <ButtonV2
          title="Hủy"
          color="charcoal"
          onPress={onCancel}
          style={{ minWidth: 100, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
        <ButtonV2
          title={loading ? 'Đang tạo...' : 'Tạo mới'}
          color="poppy"
          onPress={onSubmit}
          style={{ minWidth: 120, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
    </div>
  )
}

export default VocabularyFormActions

