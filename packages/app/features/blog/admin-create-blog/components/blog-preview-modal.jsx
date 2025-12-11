'use client'
import React from 'react'
import { Modal, Typography, Tag, Divider, Image, Space } from 'antd'
import { UserOutlined, CalendarOutlined, EyeOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export function BlogPreviewModal({ open, onCancel, data }) {
  if (!data) return null

  // Mapping Category ID sang tên hiển thị (Có thể tách ra file constant chung)
  const getCategoryName = (id) => {
    const categories = {
      'cat_korea_culture': 'Văn hóa Hàn Quốc',
      'cat_topik_exam': 'Luyện thi TOPIK',
      'cat_fashion': 'Thời trang'
    }
    return categories[id] || id
  }

  return (
    <Modal
      title="Xem trước bài viết"
      centered
      open={open}
      onCancel={onCancel}
      width={1000} // Rộng chút xem cho sướng
      footer={null} // Không cần nút OK/Cancel ở dưới
    >
      <div style={{ padding: '0 20px 20px' }}>
        
        {/* 1. Header: Category & Meta */}
        <Space style={{ marginBottom: 10 }}>
          <Tag color="blue">{getCategoryName(data.categoryId)}</Tag>
          <Text type="secondary"><CalendarOutlined /> {new Date().toLocaleDateString('vi-VN')}</Text>
          <Text type="secondary"><UserOutlined /> Admin</Text>
        </Space>

        {/* 2. Title */}
        <Title level={1} style={{ marginTop: 0 }}>{data.title || 'Chưa có tiêu đề'}</Title>

        {/* 3. Short Description */}
        <Paragraph style={{ fontSize: 16, fontStyle: 'italic', color: '#666', borderLeft: '4px solid #ccc', paddingLeft: 10 }}>
          {data.shortDescription}
        </Paragraph>

        {/* 4. Thumbnail */}
        {data.thumbnailUrl && (
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Image 
              src={data.thumbnailUrl} 
              alt="Thumbnail" 
              style={{ maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
            />
          </div>
        )}

        <Divider />

        {/* 5. CONTENT HTML (Quan trọng nhất) */}
        <div 
          className="blog-content-preview"
          style={{ fontSize: 16, lineHeight: 1.8 }}
          // Render HTML từ ReactQuill an toàn
          dangerouslySetInnerHTML={{ __html: data.content }} 
        />

        <Divider />

        {/* 6. Tags */}
        <div style={{ marginTop: 20 }}>
          <Text strong style={{ marginRight: 10 }}>Tags:</Text>
          {data.tags?.map(tag => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </div>

      </div>
    </Modal>
  )
}