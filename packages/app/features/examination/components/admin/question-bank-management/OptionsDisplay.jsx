'use client'

import React from 'react'
import { Row, Col, Tag, Typography } from 'antd'

const { Text } = Typography

/**
 * Component hiển thị đáp án (khi không edit)
 */
export function OptionsDisplay({ options }) {
  if (!options || options.length === 0) return null

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
      {options.map((option, ansIndex) => {
        const isCorrect = option.status === true || option.isCorrect === true
        return (
          <Col span={12} key={ansIndex}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${isCorrect ? '#52c41a' : '#d9d9d9'}`,
                backgroundColor: isCorrect ? '#f6ffed' : '#fff',
              }}
            >
              <Tag color={isCorrect ? 'success' : 'default'} style={{ marginRight: 10 }}>
                {String.fromCharCode(65 + ansIndex)}
              </Tag>
              <Text>{option?.content || option?.keyOption || option?.label || '-'}</Text>
              {option.imageUrl || option.imageUrl1 ? (
                <img
                  src={option.imageUrl || option.imageUrl1}
                  alt="Option"
                  style={{ maxWidth: 80, maxHeight: 80, marginLeft: 8, borderRadius: 6 }}
                />
              ) : null}
            </div>
          </Col>
        )
      })}
    </Row>
  )
}

