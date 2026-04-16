'use client'

import React from 'react'
import { Row, Col, Space, Typography, Image } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'
import { Row, Col, Space, Typography, Image } from 'antd'
import { CheckCircleFilled } from '@ant-design/icons'

const { Text } = Typography

/**
 * Component hiển thị danh sách đáp án với giao diện hiện đại
 * Component hiển thị danh sách đáp án với giao diện hiện đại
 */
export function OptionsDisplay({ options }) {
  if (!options || !Array.isArray(options) || options.length === 0) return null
  if (!options || !Array.isArray(options) || options.length === 0) return null

  return (
    <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
      {options.map((option, idx) => {
        const isCorrect = option.isCorrect === true || option.status === true
        
        return (
          <Col xs={24} md={12} key={idx}>
            <div style={{
              padding: '10px 14px',
              borderRadius: 14,
              border: '1px solid',
              borderColor: isCorrect ? '#d3f9d8' : '#f0f0f0',
              backgroundColor: isCorrect ? '#f6ffed' : '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'all 0.2s ease',
              minHeight: 52,
              boxShadow: isCorrect ? '0 2px 6px rgba(82, 196, 26, 0.08)' : 'none',
              cursor: 'default'
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                fontSize: 13,
                fontWeight: 700,
                backgroundColor: isCorrect ? '#52c41a' : '#fafafa',
                color: isCorrect ? '#ffffff' : '#8c8c8c',
                border: isCorrect ? 'none' : '1px solid #d9d9d9',
                boxShadow: isCorrect ? '0 2px 4px rgba(82, 196, 26, 0.2)' : 'none'
              }}>
                {isCorrect ? <CheckCircleFilled style={{ fontSize: 16 }} /> : String.fromCharCode(65 + idx)}
              </div>
              
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <Text style={{ 
                  fontSize: 14, 
                  color: isCorrect ? '#1d39c4' : '#262626', 
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
                      height={40}
                      style={{ borderRadius: 8, border: '1px solid #f0f0f0', objectFit: 'contain', backgroundColor: '#fff' }}
                      preview={{ mask: null }}
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

