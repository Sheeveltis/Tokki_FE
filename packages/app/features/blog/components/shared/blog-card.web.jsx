import React from 'react'
import { Typography } from 'antd'
import { motion } from 'framer-motion'

const { Title, Text, Paragraph } = Typography

const FALLBACK_AVATAR = 'https://ui-avatars.com/api/?name=Tokki&background=F1BE4B&color=fff&size=64'
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1547036967-23d1199d3b21?auto=format&fit=crop&w=600'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' })
}

/**
 * BlogCard (Web): Hiển thị card bài viết với ảnh thumbnail, danh mục,
 * tiêu đề, mô tả ngắn, avatar tác giả, tên và thời gian đăng.
 */
export function BlogCard({ item, onPress }) {
  const { thumbnailUrl, title, shortDescription, categoryName, author, createdAt } = item
  const avatarSrc = author?.avatarUrl || FALLBACK_AVATAR
  const authorName = author?.fullName || 'Ẩn danh'

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      onClick={onPress}
      className="bc-wrapper"
      style={{ cursor: 'pointer' }}
    >
      {/* ── Thumbnail ── */}
      <div className="bc-img-wrap">
        <img
          src={thumbnailUrl || FALLBACK_IMG}
          className="bc-img"
          alt={title}
        />
        {/* Category pill overlay */}
        {categoryName && (
          <span className="bc-cat-pill">{categoryName}</span>
        )}
      </div>

      {/* ── Content ── */}
      <div className="bc-body">
        <Title level={4} className="bc-title">
          {title}
        </Title>

        <Paragraph className="bc-desc">
          {shortDescription}
        </Paragraph>

        {/* ── Author row ── */}
        <div className="bc-author-row">
          <img
            src={avatarSrc}
            className="bc-avatar"
            alt={authorName}
            style={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(241,190,75,0.27)' }}
            onError={e => { e.currentTarget.src = FALLBACK_AVATAR }}
          />
          <div className="bc-author-info">
            <span className="bc-author-name">{authorName}</span>
            <span className="bc-date">{formatDate(createdAt)}</span>
          </div>
        </div>
      </div>

      {/* ── Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .bc-wrapper {
          border-radius: 24px;
          overflow: hidden;
          background: #fff;
          border: 1px solid #F3EDD8;
          transition: box-shadow 0.3s ease, transform 0.3s ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .bc-wrapper:hover {
          box-shadow: 0 16px 48px rgba(212,166,50,0.14);
          border-color: #F1BE4B44;
        }

        /* thumbnail */
        .bc-img-wrap {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: #f8fafc;
          flex-shrink: 0;
        }
        .bc-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .bc-wrapper:hover .bc-img {
          transform: scale(1.07);
        }

        /* category pill on image */
        .bc-cat-pill {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #F1BE4B;
          color: #fff;
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          padding: 4px 12px;
          border-radius: 100px;
          font-family: 'Epilogue', sans-serif;
          pointer-events: none;
        }

        /* body */
        .bc-body {
          padding: 20px 20px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0;
        }

        /* title */
        .bc-title {
          font-size: 18px !important;
          font-weight: 800 !important;
          color: #0f172a !important;
          line-height: 1.4 !important;
          margin-bottom: 10px !important;
          margin-top: 0 !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: 'Epilogue', sans-serif !important;
          transition: color 0.2s ease;
        }
        .bc-wrapper:hover .bc-title {
          color: #D9A635 !important;
        }

        /* description */
        .bc-desc {
          color: #64748b !important;
          font-size: 14px !important;
          line-height: 1.65 !important;
          display: -webkit-box !important;
          -webkit-line-clamp: 3 !important;
          -webkit-box-orient: vertical !important;
          overflow: hidden !important;
          margin-bottom: 18px !important;
          flex: 1;
          font-family: 'Epilogue', sans-serif !important;
        }

        /* author row */
        .bc-author-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 14px;
          border-top: 1px solid #F3EDD8;
          margin-top: auto;
        }
        .bc-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #F1BE4B44;
          flex-shrink: 0;
        }
        .bc-author-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .bc-author-name {
          font-size: 13px;
          font-weight: 700;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-family: 'Epilogue', sans-serif;
        }
        .bc-date {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 500;
          font-family: 'Epilogue', sans-serif;
        }
      `}} />
    </motion.div>
  )
}
