import React from 'react'
import { Typography } from 'antd'

const { Title } = Typography

// Giả lập list Tags phổ biến
const POPULAR_TAGS = [
  "Văn hóa Hàn Quốc", "Quy tắc bàn ăn", "Kỹ năng sống", 
  "Du lịch Seoul", "Ẩm thực", "Ngữ pháp sơ cấp"
]

export const TagFilter = React.memo(function TagFilter({ selectedTags = [], onToggle }) {
  return (
    <div className="tag-filter-wrapper">
      <Title level={5} style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', marginBottom: '16px', letterSpacing: '0.1em' }}>
        Tìm theo thẻ
      </Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {POPULAR_TAGS.map(tag => {
          const isSelected = selectedTags.includes(tag)
          
          return (
            <div 
              key={tag}
              className={`tag-item ${isSelected ? 'active' : ''}`}
              onClick={() => onToggle(tag)}
              style={{ 
                padding: '6px 16px', 
                borderRadius: '8px', 
                backgroundColor: isSelected ? '#F1BE4B' : '#f8fafc', 
                color: isSelected ? 'white' : '#64748b',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? '#F1BE4B' : '#f1f5f9',
                transition: 'all 0.3s ease'
              }}
            >
              #{tag}
            </div>
          )
        })}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .tag-item:hover {
          border-color: #F1BE4B !important;
          color: #F1BE4B !important;
        }
        .tag-item.active:hover {
          background-color: #D9A635 !important;
          border-color: #D9A635 !important;
          color: white !important;
        }
        `
      }} />
    </div>
  )
})