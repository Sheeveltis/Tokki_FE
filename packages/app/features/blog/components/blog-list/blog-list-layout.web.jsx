import React, { useState, useMemo, useCallback } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { Row, Col, Typography, Button, Divider } from 'antd'
import { BlogSidebar } from './blog-list-sidebar'
import { CategoryFilter } from './category-filter'
import { TagFilter } from './tag-filter'
import { BlogCard } from '../shared/blog-card.web'
import { useRouter } from 'solito/navigation'
import { Loading } from '../../../../../components/Loading'
import { ArrowRightOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * BlogListLayout (Web): Layout cho trang danh sách blog
 * Tự động bao gồm Navbar và Footer
 * Layout: 3/4 content (Grid) + 1/4 sidebar
 * 
 * @param {Object} props
 * @param {Array} props.blogs - Danh sách blog
 * @param {boolean} props.loading - Đang load thêm blog
 * @param {boolean} props.hasMore - Còn blog để load
 * @param {Function} props.onLoadMore - Callback khi click "Load More"
 */
export function BlogListLayout({ blogs = [], loading = false, hasMore = false, onLoadMore }) {
  const router = useRouter()

  // --- STATE QUẢN LÝ BỘ LỌC ---
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])

  // --- HÀM TOGGLE TAG ---
  const handleToggleTag = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }, [])

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredBlogs = useMemo(() => {
    return blogs.filter(item => {
      if (selectedCategory && item.categoryId !== selectedCategory) {
        return false
      }
      if (selectedTags.length > 0) {
        const hasMatchingTag = item.tags?.some(t => selectedTags.includes(t))
        if (!hasMatchingTag) return false
      }
      return true
    })
  }, [blogs, selectedCategory, selectedTags])

  // Lấy blog mới nhất cho sidebar (sắp xếp theo createdAt)
  const latestBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5) // Top 5 blog mới nhất
  }, [blogs])

  return (
    <div className="blog-list-container" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .blog-list-container {
          font-family: 'Plus Jakarta Sans', sans-serif !important;
          background: linear-gradient(180deg, #FEF7E6 0%, #FFFFFF 300px);
        }
        .section-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #D9A635;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 13px;
          margin-bottom: 16px;
        }
        .tag-dot {
          width: 8px;
          height: 8px;
          background: #F1BE4B;
          border-radius: 50%;
        }
        `
      }} />

      {/* Hero Header - Roadmap Style */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 24px 32px' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800;900&display=swap');
          .roadmap-style-header {
            font-family: 'Epilogue', sans-serif !important;
          }
          `
        }} />
        <div className="roadmap-style-header">
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Text style={{ fontSize: '13px', color: '#999', fontWeight: '500', fontFamily: 'inherit' }}>Học tập</Text>
            <Text style={{ fontSize: '13px', color: '#EEE', fontFamily: 'inherit' }}>/</Text>
            <Text style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: '700', fontFamily: 'inherit' }}>Blog</Text>
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{ backgroundColor: '#F5F5F5', padding: '4px 10px', borderRadius: '6px' }}>
              <Text style={{ fontSize: '11px', fontWeight: '900', color: '#666', textTransform: 'uppercase', fontFamily: 'inherit' }}>CỘNG ĐỒNG</Text>
            </div>
            <div style={{ backgroundColor: '#FF6B6B', padding: '4px 10px', borderRadius: '6px' }}>
              <Text style={{ fontSize: '11px', fontWeight: '900', color: '#FFF', textTransform: 'uppercase', fontFamily: 'inherit' }}>BLOG</Text>
            </div>
          </div>

          {/* Title & Subtitle */}
          <Title level={1} style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#1A1A1A',
            marginBottom: '8px',
            lineHeight: 1.2,
            letterSpacing: '-1px',
            fontFamily: 'inherit',
            marginTop: 0
          }}>
            Blog Cộng đồng Tokki
          </Title>
          <Paragraph style={{
            color: '#666',
            fontSize: '15px',
            fontWeight: '500',
            maxWidth: '600px',
            lineHeight: 1.6,
            margin: 0,
            fontFamily: 'inherit'
          }}>
            Khám phá những kinh nghiệm học tiếng Hàn, bí quyết luyện thi TOPIK và những câu chuyện văn hóa thú vị từ cộng đồng.
          </Paragraph>
        </div>
      </div>


      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>
        <Row gutter={[48, 48]}>
          {/* Main Content Area */}
          <Col xs={24} lg={18}>
            {/* Filters */}
            <div style={{ marginBottom: '40px', backgroundColor: 'rgba(255,255,255,0.5)', padding: '24px', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
              <CategoryFilter
                selectedId={selectedCategory}
                onSelect={setSelectedCategory}
              />
              <TagFilter
                selectedTags={selectedTags}
                onToggle={handleToggleTag}
              />
            </div>

            {/* Blog Grid */}
            <Row gutter={[32, 40]}>
              {filteredBlogs.map((item) => (
                <Col xs={24} md={12} key={item.id}>
                  <BlogCard
                    item={item}
                    onPress={() => router.push(`/blog/${item.slug}`)}
                  />
                </Col>
              ))}
            </Row>

            {filteredBlogs.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <Title level={4} style={{ color: '#94a3b8' }}>Không tìm thấy bài viết phù hợp</Title>
                <Paragraph style={{ color: '#94a3b8' }}>Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</Paragraph>
              </div>
            )}

            {/* Load More Button */}
            {hasMore && filteredBlogs.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '60px' }}>
                {loading ? (
                  <Loading size={24} color="#F1BE4B" shadowColor="#F1BE4B50" />
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    onClick={onLoadMore}
                    style={{
                      backgroundColor: '#0f172a',
                      borderColor: '#0f172a',
                      height: '54px',
                      padding: '0 40px',
                      borderRadius: '16px',
                      fontWeight: 700,
                      fontSize: '16px'
                    }}
                  >
                    Xem thêm bài viết <ArrowRightOutlined />
                  </Button>
                )}
              </div>
            )}
          </Col>

          {/* Sidebar Area */}
          <Col xs={24} lg={6}>
            <div style={{ position: 'sticky', top: '100px' }}>
              <BlogSidebar latestBlogs={latestBlogs} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  )
}

