import React from 'react'
import { useRouter } from 'solito/navigation'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1547036967-23d1199d3b21?auto=format&fit=crop&w=200'

function formatShortDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long' })
}

/**
 * BlogDetailSidebar (Web) — sidebar bài viết cùng chuyên mục
 */
export function BlogDetailSidebar({ relatedPosts = [] }) {
  const router = useRouter()

  if (!relatedPosts || relatedPosts.length === 0) return null

  return (
    <div style={{ fontFamily: "'Epilogue', sans-serif" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        .blds-item { 
          transition: all 0.3s ease; 
          padding: 10px !important;
          border-radius: 16px !important;
          margin-bottom: 8px;
        }
        .blds-item:hover { 
          background: #fff !important; 
          transform: translateY(-2px); 
          box-shadow: 0 10px 20px rgba(241, 190, 75, 0.12);
        }
        .blds-item:hover .blds-item-title { color: #D9A635 !important; }
        `
      }} />

      {/* Section label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F1BE4B' }} />
        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#D9A635' }}>
          Đề xuất đọc thêm
        </span>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>
        Cùng chuyên mục
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {relatedPosts.slice(0, 3).map((post, idx) => (
          <React.Fragment key={post.id}>
            <div
              className="blds-item"
              onClick={() => router.push(`/blog/${post.slug}`)}
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                cursor: 'pointer',
                background: 'transparent',
                alignItems: 'flex-start'
              }}
            >
              {/* Thumbnail - fixed size with units */}
              <div style={{ width: '100px', height: '70px', flexShrink: 0 }}>
                <img
                  src={post.thumbnailUrl || FALLBACK_IMG}
                  alt={post.title}
                  onError={e => { e.currentTarget.src = FALLBACK_IMG }}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    display: 'block',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                  }}
                />
              </div>

              {/* Text area */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {post.categoryName && (
                  <span style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    color: '#F1BE4B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'block',
                    marginBottom: '4px',
                  }}>
                    {post.categoryName}
                  </span>
                )}
                {post.title && (
                  <h4
                    className="blds-item-title"
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#1e293b',
                      lineHeight: 1.3,
                      margin: '0 0 6px',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      wordBreak: 'break-word',
                    }}
                  >
                    {post.title}
                  </h4>
                )}
                {post.shortDescription && (
                  <p style={{
                    fontSize: '11px',
                    color: '#64748b',
                    lineHeight: 1.4,
                    margin: '0 0 8px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {post.shortDescription}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '10px' }}>
                  <span>{formatShortDate(post.createdAt)}</span>
                  <span>•</span>
                  <span>{post.viewCount || 0} lượt xem</span>
                </div>
              </div>
            </div>

            {idx < relatedPosts.length - 1 && (
              <div style={{ height: '1px', background: '#f1f5f9', margin: '8px 10px' }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}