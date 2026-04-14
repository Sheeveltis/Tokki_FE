import React, { useState, useMemo, useCallback } from 'react'
import { Typography, Button, Input, FloatButton, Tooltip, message, ConfigProvider } from 'antd'
import { BlogSidebar } from './blog-list-sidebar'
import { CategoryFilter } from './category-filter'
import { BlogCard } from '../shared/blog-card.web'
import { useRouter } from 'solito/navigation'
import { Loading } from '../../../../../components/Loading'
import { ArrowRightOutlined, SearchOutlined, SettingOutlined, FileTextOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

/**
 * BlogListLayout (Web): Layout cao cấp cho trang danh sách blog
 * Hero banner + filter bar + 3-col grid + sidebar
 *
 * @param {Object} props
 * @param {Array} props.blogs - Danh sách blog
 * @param {boolean} props.loading - Đang load thêm blog
 * @param {boolean} props.hasMore - Còn blog để load
 * @param {Function} props.onLoadMore - Callback khi click "Load More"
 */
export function BlogListLayout({ blogs = [], loading = false, hasMore = false, onLoadMore }) {
  const router = useRouter()

  // --- STATE ---
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedTags, setSelectedTags] = useState([])
  const [searchText, setSearchText] = useState('')

  // --- TOGGLE TAG ---
  const handleToggleTag = useCallback((tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }, [])

  // --- LỌC DỮ LIỆU ---
  const filteredBlogs = useMemo(() => {
    return blogs.filter(item => {
      if (selectedCategory && item.categoryId !== selectedCategory) return false
      if (selectedTags.length > 0) {
        const hasMatchingTag = item.tags?.some(t => selectedTags.includes(t))
        if (!hasMatchingTag) return false
      }
      if (searchText.trim()) {
        const q = searchText.toLowerCase()
        const match =
          item.title?.toLowerCase().includes(q) ||
          item.shortDescription?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [blogs, selectedCategory, selectedTags, searchText])

  // Blog nổi bật (đầu tiên)
  const featuredBlog = blogs[0] || null
  // Blog mới nhất cho sidebar
  const latestBlogs = useMemo(() => {
    return [...blogs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [blogs])

  return (
    <div className="blg-root">
      {/* ─── Inline CSS ─── */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Epilogue:wght@400;500;600;700;800;900&display=swap');

        .blg-root {
          font-family: 'Epilogue', sans-serif;
          background: linear-gradient(180deg, #FEF7E6 0%, #FFFFFF 340px);
          min-height: 100vh;
          color: #1A1A1A;
        }

        /* ── PAGE HEADER ── */
        .blg-page-header {
          max-width: 1400px;
          margin: 0 auto;
          padding: 28px 24px 20px;
        }
        .blg-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
        }

        .blg-page-title {
          font-size: 32px !important;
          font-weight: 900 !important;
          color: #1A1A1A !important;
          letter-spacing: -1px !important;
          line-height: 1.15 !important;
          margin-top: 0 !important;
          margin-bottom: 8px !important;
          font-family: 'Epilogue', sans-serif !important;
        }
        .blg-page-subtitle {
          color: #666;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.6;
          font-family: 'Epilogue', sans-serif;
        }

        /* ── HERO BANNER ── */
        .blg-hero {
          max-width: 1400px;
          margin: 0 auto 40px;
          padding: 0 24px;
        }
        .blg-hero-card {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          height: 460px;
          cursor: pointer;
          background: #1A1A1A;
        }
        .blg-hero-card:hover .blg-hero-img {
          transform: scale(1.06);
        }
        .blg-hero-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 1s ease;
        }
        .blg-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.18) 50%, transparent 100%);
        }
        .blg-hero-content {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: 40px 48px;
          max-width: 680px;
        }
        .blg-hero-label {
          display: inline-block;
          background: #F1BE4B;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 5px 14px;
          border-radius: 100px;
          margin-bottom: 16px;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-hero-title {
          font-size: 40px !important;
          font-weight: 900 !important;
          color: #fff !important;
          line-height: 1.15 !important;
          margin: 0 0 14px !important;
          font-family: 'Epilogue', sans-serif !important;
        }
        .blg-hero-desc {
          color: rgba(255,255,255,0.8);
          font-size: 16px;
          line-height: 1.6;
          margin: 0 0 20px;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-hero-read-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #F1BE4B;
          color: #1A1A1A;
          font-weight: 800;
          font-size: 14px;
          padding: 10px 24px;
          border-radius: 100px;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-hero-read-btn:hover {
          background: #D9A635;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(241,190,75,0.35);
        }
        .blg-hero-author {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }
        .blg-hero-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255,255,255,0.4);
          flex-shrink: 0;
        }
        .blg-hero-author-name {
          font-size: 14px;
          font-weight: 700;
          color: #fff;
          display: block;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-hero-author-date {
          font-size: 12px;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
          font-family: 'Epilogue', sans-serif;
        }

        /* ── FILTER BAR ── */
        .blg-filter-bar {
          max-width: 1400px;
          margin: 0 auto 36px;
          padding: 0 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .blg-filter-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .blg-category-scroll {
          display: flex;
          align-items: center;
          gap: 10px;
          overflow-x: auto;
          overflow-y: visible;
          padding-top: 6px;
          padding-bottom: 6px;
          margin-top: -6px;
          scrollbar-width: none;
        }
        .blg-category-scroll::-webkit-scrollbar { display: none; }

        .blg-cat-btn {
          display: inline-flex;
          align-items: center;
          padding: 9px 22px;
          border-radius: 100px;
          border: 1.5px solid #E8DDC0;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.25s ease;
          background: #fff;
          color: #6A5634;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-cat-btn:hover {
          border-color: #F1BE4B;
          color: #D9A635;
          background: #FEF7E6;
        }
        .blg-cat-btn.active {
          background: #F1BE4B;
          border-color: #F1BE4B;
          color: #fff;
          box-shadow: 0 4px 16px rgba(241,190,75,0.3);
          transform: translateY(-1px);
        }

        .blg-search-wrap {
          position: relative;
        }
        .blg-search-wrap .ant-input-affix-wrapper {
          border-radius: 100px !important;
          border: 1.5px solid #E8DDC0 !important;
          background: #fff !important;
          padding: 8px 18px !important;
          box-shadow: none !important;
          font-family: 'Epilogue', sans-serif !important;
          width: 260px;
          transition: all 0.25s ease;
        }
        .blg-search-wrap .ant-input-affix-wrapper:hover,
        .blg-search-wrap .ant-input-affix-wrapper:focus-within {
          border-color: #F1BE4B !important;
          box-shadow: 0 4px 16px rgba(241,190,75,0.15) !important;
        }
        .blg-search-wrap .ant-input {
          font-family: 'Epilogue', sans-serif !important;
          font-size: 14px !important;
          background: transparent !important;
        }

        /* ── BODY LAYOUT ── */
        .blg-body {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px 80px;
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 48px;
        }
        @media (max-width: 1024px) {
          .blg-body { grid-template-columns: 1fr; }
          .blg-sidebar { display: none; }
        }

        /* ── SECTION HEADER ── */
        .blg-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .blg-section-label {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #D9A635;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 12px;
          margin-bottom: 6px;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-section-dot {
          width: 8px;
          height: 8px;
          background: #F1BE4B;
          border-radius: 50%;
          display: inline-block;
        }
        .blg-section-title {
          font-size: 28px !important;
          font-weight: 900 !important;
          color: #1A1A1A !important;
          margin: 0 !important;
          font-family: 'Epilogue', sans-serif !important;
        }

        /* ── TAG FILTER INLINE ── */
        .blg-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 36px;
        }
        .blg-tag-item {
          padding: 6px 16px;
          border-radius: 8px;
          border: 1.5px solid #f1f5f9;
          background: #f8fafc;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s ease;
          font-family: 'Epilogue', sans-serif;
        }
        .blg-tag-item:hover {
          border-color: #F1BE4B;
          color: #D9A635;
        }
        .blg-tag-item.active {
          background: #F1BE4B;
          border-color: #F1BE4B;
          color: #fff;
        }

        /* ── BLOG GRID ── */
        .blg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px 32px;
        }
        @media (max-width: 720px) {
          .blg-grid { grid-template-columns: 1fr; }
          .blg-hero-card { height: 280px; }
          .blg-hero-content { padding: 24px; }
          .blg-hero-title { font-size: 26px !important; }
        }

        /* ── EMPTY STATE ── */
        .blg-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 80px 0;
        }

        /* ── LOAD MORE ── */
        .blg-load-more {
          grid-column: 1 / -1;
          text-align: center;
          margin-top: 24px;
        }
        .blg-load-more-btn {
          height: 52px !important;
          padding: 0 40px !important;
          border-radius: 100px !important;
          font-weight: 800 !important;
          font-size: 15px !important;
          background: #0f172a !important;
          border-color: #0f172a !important;
          font-family: 'Epilogue', sans-serif !important;
          transition: all 0.25s ease !important;
        }
        .blg-load-more-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(15,23,42,0.2) !important;
        }
        `
      }} />

      {/* ─── PAGE HEADER ─── */}
      <div className="blg-page-header">
        <h1 className="blg-page-title">Blog Cộng đồng Tokki</h1>
        <p className="blg-page-subtitle">
          Khám phá những kinh nghiệm học tiếng Hàn, bí quyết luyện thi TOPIK và những câu chuyện văn hóa thú vị từ cộng đồng.
        </p>
      </div>

      {/* ─── HERO BANNER (blog đầu tiên) ─── */}
      {featuredBlog && (
        <div className="blg-hero">
          <div
            className="blg-hero-card"
            onClick={() => router.push(`/blog/${featuredBlog.slug}`)}
          >
            <img
              className="blg-hero-img"
              src={featuredBlog.thumbnailUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=1200'}
              alt={featuredBlog.title}
            />
            <div className="blg-hero-overlay" />
            <div className="blg-hero-content">
              <span className="blg-hero-label">
                {featuredBlog.categoryName || 'Nổi bật'}
              </span>
              <h2 className="blg-hero-title">{featuredBlog.title}</h2>
              {featuredBlog.shortDescription && (
                <p className="blg-hero-desc">
                  {featuredBlog.shortDescription.slice(0, 140)}{featuredBlog.shortDescription.length > 140 ? '...' : ''}
                </p>
              )}
              {/* Author row */}
              {featuredBlog.author && (
                <div className="blg-hero-author">
                  <img
                    className="blg-hero-avatar"
                    src={featuredBlog.author.avatarUrl || 'https://api.dicebear.com/7.x/thumbs/svg?seed=tokki'}
                    alt={featuredBlog.author.fullName}
                    onError={e => { e.currentTarget.src = 'https://api.dicebear.com/7.x/thumbs/svg?seed=tokki' }}
                  />
                  <div>
                    <span className="blg-hero-author-name">{featuredBlog.author.fullName}</span>
                    <span className="blg-hero-author-date">
                      {featuredBlog.createdAt
                        ? new Date(featuredBlog.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
                        : ''}
                    </span>
                  </div>
                </div>
              )}
              <button className="blg-hero-read-btn">
                Đọc ngay <ArrowRightOutlined />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── FILTER BAR ─── */}
      <div className="blg-filter-bar">
        <div className="blg-filter-top">
          {/* Category pills dạng mới */}
          <div className="blg-category-scroll">
            <CategoryButtonsInline
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          {/* Search */}
          <div className="blg-search-wrap">
            <Input
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              placeholder="Tìm kiếm bài viết..."
              prefix={<SearchOutlined style={{ color: '#D9A635' }} />}
            />
          </div>
        </div>
      </div>

      {/* ─── BODY (Grid + Sidebar) ─── */}
      <div className="blg-body">
        {/* ── Main Column ── */}
        <div>
          {/* Section title */}
          <div className="blg-section-header">
            <div>
              <div className="blg-section-label">
                <span className="blg-section-dot" /> Mới nhất
              </div>
              <Title level={2} className="blg-section-title">Bài viết mới</Title>
            </div>
          </div>

          {/* Tag row inline */}
          <TagFilterInline selectedTags={selectedTags} onToggle={handleToggleTag} />

          {/* Blog grid */}
          <div className="blg-grid">
            {filteredBlogs.length === 0 && !loading ? (
              <div className="blg-empty">
                <Title level={4} style={{ color: '#94a3b8', fontFamily: 'Epilogue, sans-serif' }}>
                  Không tìm thấy bài viết phù hợp
                </Title>
                <Paragraph style={{ color: '#94a3b8', fontFamily: 'Epilogue, sans-serif' }}>
                  Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.
                </Paragraph>
              </div>
            ) : (
              filteredBlogs.map(item => (
                <BlogCard
                  key={item.id}
                  item={item}
                  onPress={() => router.push(`/blog/${item.slug}`)}
                />
              ))
            )}

            {/* Load more */}
            {hasMore && filteredBlogs.length > 0 && (
              <div className="blg-load-more">
                {loading ? (
                  <Loading size={28} color="#F1BE4B" shadowColor="#F1BE4B50" />
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    className="blg-load-more-btn"
                    onClick={onLoadMore}
                  >
                    Xem thêm bài viết <ArrowRightOutlined />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="blg-sidebar" style={{ position: 'sticky', top: 100, alignSelf: 'start' }}>
          <BlogSidebar latestBlogs={latestBlogs} />
        </div>
      </div>
      {/* Floating Actions */}
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#F1BE4B',
          }
        }}
      >
        <FloatButton.BackTop visibilityHeight={400} style={{ right: 24, bottom: 24 }} />
        <FloatButton.Group
          trigger="hover"
          type="primary"
          style={{ left: 24, bottom: 175 }}
          icon={<SettingOutlined />}
        >
          <Tooltip title="Quản lý bài viết" placement="right">
            <FloatButton icon={<FileTextOutlined />} onClick={() => router.push('/blog/management')} />
          </Tooltip>
          <Tooltip title="Viết bài mới" placement="right">
            <FloatButton icon={<PlusOutlined />} onClick={() => router.push('/blog/create')} />
          </Tooltip>
        </FloatButton.Group>
      </ConfigProvider>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   Inline Category Buttons (replaces CategoryFilter component UI)
   ───────────────────────────────────────────────────────────── */
const CATEGORIES = [
  { id: null, name: 'Tất cả' },
  { id: 'x2bgHp432Q', name: 'Văn hóa & Đời sống' },
  { id: 'cat_topik', name: 'Luyện thi TOPIK' },
  { id: 'cat_duhoc', name: 'Du học' },
]

function CategoryButtonsInline({ selectedId, onSelect }) {
  return (
    <>
      {CATEGORIES.map(cat => (
        <button
          key={cat.id || 'all'}
          className={`blg-cat-btn${selectedId === cat.id ? ' active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </>
  )
}

/* ─────────────────────────────────────────────────────────────
   Inline Tag Filter Row
   ───────────────────────────────────────────────────────────── */
const POPULAR_TAGS = [
  'Văn hóa Hàn Quốc', 'Quy tắc bàn ăn', 'Kỹ năng sống',
  'Du lịch Seoul', 'Ẩm thực', 'Ngữ pháp sơ cấp',
]

function TagFilterInline({ selectedTags, onToggle }) {
  return (
    <div className="blg-tags">
      {POPULAR_TAGS.map(tag => (
        <div
          key={tag}
          className={`blg-tag-item${selectedTags.includes(tag) ? ' active' : ''}`}
          onClick={() => onToggle(tag)}
        >
          #{tag}
        </div>
      ))}
    </div>
  )
}
