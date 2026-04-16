import React from 'react'
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { Typography, Divider } from 'antd'
import { useRouter } from 'solito/navigation'

const { Title, Text } = Typography

/**
 * BlogSidebar: Sidebar hiển thị blog mới nhất
 * Chiếm 1/4 chiều rộng trên Web
 */
export const BlogSidebar = React.memo(function BlogSidebar({ latestBlogs }) {
  const router = useRouter()

  if (!latestBlogs || latestBlogs.length === 0) {
    return null
  }

  return (
    <div className="blog-sidebar" style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', border: '1px solid #f1f5f9' }}>
      <Title level={4} style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>
        Bài viết mới nhất
      </Title>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {latestBlogs.map((blog) => (
          <div
            key={blog.id}
            className="sidebar-blog-item"
            onClick={() => router.push(`/blog/${blog.slug}`)}
            style={{ 
              display: 'flex', 
              gap: '16px', 
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
              <img
                src={blog.thumbnailUrl}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                alt={blog.title}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Title level={5} style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                color: '#1e293b', 
                marginBottom: '8px',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {blog.title}
              </Title>
              <Text style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                {new Date(blog.createdAt).toLocaleDateString('vi-VN')}
              </Text>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .sidebar-blog-item:hover h5 {
          color: #F1BE4B !important;
        }
        .sidebar-blog-item:hover img {
          transform: scale(1.1);
        }
        .sidebar-blog-item img {
          transition: transform 0.4s ease;
        }
        `
      }} />
    </div>
  )
})

