'use client'

import React from 'react'
import { Row, Col, Space, Typography, Image } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'

const { Text } = Typography

/**
 * Component hiển thị danh sách đáp án với giao diện hiện đại
 */
export function OptionsDisplay({ options }) {
  if (!options || !Array.isArray(options) || options.length === 0) return null

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
      {options.map((option, idx) => {
        const isCorrect = option.isCorrect === true || option.status === true
        
        return (
          <Col xs={24} md={12} key={idx}>
            <div style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: '1px solid',
              borderColor: isCorrect ? '#b7eb8f' : '#f0f0f0',
              backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.3s ease',
              minHeight: 56,
              boxShadow: isCorrect ? '0 2px 8px rgba(82, 196, 26, 0.1)' : 'none'
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 600,
                backgroundColor: isCorrect ? '#52c41a' : '#f5f5f5',
                color: isCorrect ? '#ffffff' : '#595959',
                border: isCorrect ? 'none' : '1px solid #d9d9d9',
                boxShadow: isCorrect ? '0 2px 4px rgba(82, 196, 26, 0.2)' : 'none'
              }}>
                {isCorrect ? <CheckCircleFilled style={{ fontSize: 18 }} /> : String.fromCharCode(65 + idx)}
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ 
                  fontSize: 15, 
                  color: isCorrect ? '#141414' : '#262626', 
                  fontWeight: isCorrect ? 600 : 400,
                  lineHeight: 1.4
                }}>
                  {option.content || option.keyOption || option.label || '—'}
                </Text>
                
                {(option.imageUrl || option.imageUrl1) && (
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={option.imageUrl || option.imageUrl1}
                      alt={`Option ${String.fromCharCode(65 + idx)}`}
                      height={44}
                      style={{ borderRadius: 6, border: '1px solid #f0f0f0', objectFit: 'contain' }}
                      preview={{ mask: 'Xem' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </Col>
        )
      })}
    </Row>
  )
}

