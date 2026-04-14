'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'solito/navigation'
import { ConfigProvider, Button, Typography, Space, Card, Spin, Tag, Avatar } from 'antd'
import { ArrowLeftOutlined, EditOutlined, ClockCircleOutlined, UserOutlined, EyeOutlined } from '@ant-design/icons'

import { getBlogUserDetail } from '../../api'
import { HtmlViewer } from '../../components/blog-detail/html-viewer'

const { Title, Text } = Typography

const BUTTON_STYLE = {
  borderRadius: 24,
  height: 44,
  padding: '0 24px',
  fontWeight: 600,
  fontSize: 15
}

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=Tokki&background=F1BE4B&color=fff&size=64'

export function BlogPreviewScreen() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      setLoading(true)
      try {
        const detail = await getBlogUserDetail(id)
        setData(detail)
      } catch (err) {
        console.error('Error fetching preview:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
    window.scrollTo(0, 0)
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', flexDirection: 'column', gap: 20, backgroundColor: '#FDFBF4' }}>
        <Spin size="large" />
        <Text type="secondary" style={{ fontSize: 16 }}>Đang chuẩn bị bản xem trước...</Text>
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: '#FDFBF4', minHeight: '100vh' }}>
        <Title level={4}>Không tìm thấy bài viết</Title>
        <Button onClick={() => router.push('/blog/management')} type="primary" style={BUTTON_STYLE}>
          Quay lại quản lý
        </Button>
      </div>
    )
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#F1BE4B',
          borderRadius: 16,
          fontFamily: "'Plus Jakarta Sans', 'Epilogue', sans-serif",
        }
      }}
    >
      <div style={{ backgroundColor: '#FDFBF4', minHeight: '100vh', padding: '40px 24px' }}>
        <div style={{ width: '92%', maxWidth: 1200, margin: '0 auto' }}>
          
          {/* Header tương tự Editor */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap', 
            gap: 20, 
            marginBottom: 32 
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Button 
                  type="text" 
                  icon={<ArrowLeftOutlined />} 
                  onClick={() => router.push('/blog/management')}
                  style={{ borderRadius: '50%', width: 40, height: 40 }}
                />
                <Title level={2} style={{ margin: 0 }}>
                  Xem trước bài viết
                </Title>
              </div>
              <Text type="secondary" style={{ fontSize: 16, marginLeft: 52 }}>
                Bản xem trước nội dung tâm huyết của bạn trước khi đến với mọi người
              </Text>
            </div>

            <Space size="middle" wrap>
              <Tag color="gold" style={{ borderRadius: 8, fontWeight: 700, padding: '4px 12px' }}>CHẾ ĐỘ XEM TRƯỚC</Tag>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => router.push(`/blog/edit/${data.id}`)}
                style={BUTTON_STYLE}
              >
                Chỉnh sửa bài viết
              </Button>
            </Space>
          </div>

          <Card variant="borderless" style={{ borderRadius: 24, boxShadow: '0 8px 24px rgba(0,0,0,0.04)', padding: '20px' }}>
            {/* Meta Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <Avatar size={56} src={data.author?.avatarUrl || FALLBACK_AVATAR} icon={<UserOutlined />} style={{ border: '2px solid #F1BE4B33' }} />
              <div>
                <div style={{ fontWeight: 800, color: '#1A1A1A', fontSize: 17 }}>{data.author?.fullName || 'Tác giả'}</div>
                <Space size="middle" style={{ marginTop: 4 }}>
                  <Text type="secondary" style={{ fontSize: 13 }}><ClockCircleOutlined /> {new Date(data.createdAt).toLocaleDateString('vi-VN')}</Text>
                  <Text type="secondary" style={{ fontSize: 13 }}><EyeOutlined /> {data.viewCount || 0} lượt xem</Text>
                  <Tag color="blue" style={{ borderRadius: 4, margin: 0, fontWeight: 700 }}>{data.categoryName || 'Sơ cấp'}</Tag>
                </Space>
              </div>
            </div>

            {/* Thumbnail */}
            {data.thumbnailUrl && (
              <div style={{ marginBottom: 40 }}>
                <img 
                  src={data.thumbnailUrl} 
                  style={{ width: '100%', maxHeight: 500, objectFit: 'cover', borderRadius: 24, boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }} 
                  alt={data.title} 
                />
              </div>
            )}

            {/* Title & Description */}
            <Title level={1} style={{ fontSize: 36, fontWeight: 900, marginBottom: 24, color: '#1A1A1A' }}>
              {data.title}
            </Title>
            
            {data.shortDescription && (
              <div style={{ 
                padding: '24px', 
                backgroundColor: '#FEF7E6', 
                borderRadius: '16px', 
                borderLeft: '4px solid #F1BE4B',
                marginBottom: 40,
                fontSize: 17,
                fontStyle: 'italic',
                color: '#8D6E63',
                lineHeight: 1.6
              }}>
                {data.shortDescription}
              </div>
            )}

            {/* Content */}
            <div style={{ 
              paddingTop: 32, 
              borderTop: '1px solid #F1F5F9' 
            }}>
              <HtmlViewer html={data.content} />
            </div>

            {/* Tags Bottom */}
            {data.tags && data.tags.length > 0 && (
              <div style={{ marginTop: 48, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Text strong style={{ marginRight: 8, color: '#8D6E63' }}>Từ khóa:</Text>
                {data.tags.map(tag => (
                  <Tag key={tag} style={{ borderRadius: 6, background: '#F8FAFC', padding: '2px 10px', fontWeight: 600 }}>#{tag}</Tag>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </ConfigProvider>
  )
}
