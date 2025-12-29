'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Card, Descriptions, Image, Tag, Space, Button } from 'antd'
import { RightOutlined } from '@ant-design/icons'

export function VocabularyInfoCard({ vocab }) {
  const router = useRouter()
  
  if (!vocab) return null

  const topics = Array.isArray(vocab?.topics) ? vocab.topics : []

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Card>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Từ">{vocab.text || '-'}</Descriptions.Item>
          <Descriptions.Item label="Phiên âm">{vocab.pronunciation || '-'}</Descriptions.Item>
          <Descriptions.Item label="Định nghĩa">{vocab.definition || '-'}</Descriptions.Item>
          <Descriptions.Item label="Ảnh minh họa">
            {vocab.imgURL ? (
              <Image
                src={vocab.imgURL}
                alt={vocab.text || 'Vocabulary image'}
                style={{ maxWidth: 400, maxHeight: 300, objectFit: 'contain' }}
                preview={{
                  mask: 'Xem ảnh',
                }}
              />
            ) : (
              '-'
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {topics.length > 0 && (
        <Card title="Danh sách chủ đề" style={{ marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {topics.map((topic) => (
              <div
                key={topic.topicId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: 6,
                  backgroundColor: '#fafafa',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#8c8c8c', marginRight: 8 }}>ID:</span>
                    <span style={{ fontSize: 12, color: '#595959', fontFamily: 'monospace' }}>
                      {topic.topicId || '-'}
                    </span>
                  </div>
                  <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                    {topic.topicName || '-'}
                  </Tag>
                </div>
                <Button
                  type="primary"
                  icon={<RightOutlined />}
                  onClick={() => window.open(`/admin/vocab-topic/${topic.topicId}`, '_blank')}
                  style={{ marginLeft: 12 }}
                >
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </Space>
        </Card>
      )}
    </Space>
  )
}

export default VocabularyInfoCard

