'use client'

import { Space, Button } from 'antd'

export function VocabularyFormActions({ loading, onCancel, onSubmit }) {
  return (
    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
      <Space>
        <Button onClick={onCancel}>Hủy</Button>
        <Button type="primary" onClick={onSubmit} loading={loading}>
          {loading ? 'Đang tạo...' : 'Tạo mới'}
        </Button>
      </Space>
    </div>
  )
}

export default VocabularyFormActions

