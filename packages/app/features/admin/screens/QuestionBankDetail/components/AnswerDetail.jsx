'use client'

import React from 'react'
import { Card, Space, Tag, Typography } from 'antd'

const { Text, Title } = Typography

/**
 * AnswerDetail Component
 * Hiển thị danh sách đáp án của câu hỏi
 */
export function AnswerDetail({ answers }) {
  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        Đáp án ({answers?.length || 0})
      </Title>
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {answers && answers.length > 0 ? (
          answers.map((answer, index) => (
            <Card
              key={index}
              style={{
                border: answer.isCorrect ? '2px solid #52c41a' : '1px solid #d9d9d9',
                backgroundColor: answer.isCorrect ? '#f6ffed' : '#fff',
              }}
            >
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text strong={answer.isCorrect} style={{ fontSize: 14 }}>
                  Đáp án {index + 1}: {answer.content}
                </Text>
                {answer.isCorrect && (
                  <Tag color="green">Đáp án đúng</Tag>
                )}
              </Space>
            </Card>
          ))
        ) : (
          <Text type="secondary">Chưa có đáp án</Text>
        )}
      </Space>
    </div>
  )
}

