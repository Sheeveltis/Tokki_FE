'use client'
import React from 'react'
import { Modal, Typography, Tag, Space, Avatar, Divider } from 'antd'
import { UserOutlined, ClockCircleOutlined, BookOutlined } from '@ant-design/icons'
import { HtmlViewer } from '../blog-detail/html-viewer'

const { Title, Text } = Typography

export function BlogPreviewModal({ open, onCancel, data }) {
  if (!data) return null

  return (
    <Modal
      title={
        <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: '#F1BE4B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
            Chế độ xem trước
          </div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#5D4037', lineHeight: 1.3 }}>
            {data.title || 'Bài viết chưa có tiêu đề'}
          </div>
        </div>
      }
      centered
      open={open}
      onCancel={onCancel}
      width={900}
      footer={null}
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto', padding: '0 24px 40px 24px', backgroundColor: '#fff' } }}
    >
      <div style={{ paddingTop: 20 }}>
        {/* Author & Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Avatar size={40} icon={<UserOutlined />} style={{ backgroundColor: '#F1BE4B' }} />
          <div>
            <div style={{ fontWeight: 700, color: '#5D4037', fontSize: 14 }}>Tác giả (Bạn)</div>
            <Space size="middle" style={{ marginTop: 2 }}>
              <Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> {new Date().toLocaleDateString('vi-VN')}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}><BookOutlined /> Dự kiến 5 phút đọc</Text>
            </Space>
          </div>
        </div>

        {/* Categories & Tags */}
        <Space wrap style={{ marginBottom: 32 }}>
          <Tag color="gold" style={{ borderRadius: 8, fontWeight: 700 }}>Bản nháp</Tag>
          {data.tags?.map(tag => (
            <Tag key={tag} style={{ borderRadius: 8, background: '#F8FAFC', color: '#64748B', border: 'none' }}>#{tag}</Tag>
          ))}
        </Space>

        {/* Thumbnail */}
        {data.thumbnailUrl && (
          <div style={{ marginBottom: 32 }}>
            <img 
              src={data.thumbnailUrl} 
              alt="Thumbnail" 
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 20, boxShadow: '0 12px 30px rgba(0,0,0,0.1)' }}
            />
          </div>
        )}

        {/* Short Description */}
        {data.shortDescription && (
          <div style={{ 
            padding: '20px', 
            background: '#FEF7E6', 
            borderRadius: '16px', 
            borderLeft: '4px solid #F1BE4B',
            marginBottom: 32,
            fontStyle: 'italic',
            color: '#8D6E63',
            fontSize: 16
          }}>
            {data.shortDescription}
          </div>
        )}

        <Divider />

        {/* Content Render */}
        <div style={{ marginTop: 32 }}>
          <HtmlViewer html={data.content} />
        </div>
      </div>
    </Modal>
  )
}