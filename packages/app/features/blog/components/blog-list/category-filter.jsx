import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

// Giả lập data danh mục (Sau này lấy từ API)
const CATEGORIES = [
  { id: null, name: 'Tất cả' },
  { id: 'x2bgHp432Q', name: 'Văn hóa & Đời sống' },
  { id: 'cat_topik', name: 'Luyện thi TOPIK' },
  { id: 'cat_duhoc', name: 'Du học' },
]

export const CategoryFilter = React.memo(function CategoryFilter({ selectedId, onSelect }) {
  return (
    <div className="category-filter-wrapper" style={{ marginBottom: '24px' }}>
      <Title level={5} style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.1em' }}>
        Danh mục bài viết
      </Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
        {CATEGORIES.map(cat => {
          const isActive = selectedId === cat.id
          return (
            <div 
              key={cat.id || 'all'}
              className={`cat-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(cat.id)}
              style={{ 
                padding: '8px 24px', 
                borderRadius: '12px', 
                backgroundColor: isActive ? '#0f172a' : 'white', 
                color: isActive ? 'white' : '#64748b',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isActive ? '#0f172a' : '#f1f5f9',
                transition: 'all 0.3s ease'
              }}
            >
              {cat.name}
            </div>
          )
        })}
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
        .cat-item:hover {
          border-color: #F1BE4B !important;
          color: #F1BE4B !important;
        }
        .cat-item.active:hover {
          color: white !important;
          background-color: #1e293b !important;
          border-color: #1e293b !important;
        }
        `
      }} />
    </div>
  )
})