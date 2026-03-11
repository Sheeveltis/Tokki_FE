import { useRef, useState, useEffect } from 'react'
import { Input, Space, Button } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import ManagementTable from '../ManagementTable' 

// --- SUB-COMPONENT: Nút thao tác động ---
const ActionGroup = ({ actions = [] }) => {
  if (!actions || actions.length === 0) return null
  return (
    <Space>
      {actions.map((action, index) => {
        if (action.hidden) return null
        return (
          <Button
            key={action.key || index}
            onClick={action.onPress}
            icon={action.icon}
            style={{ minWidth: 80, ...action.style }}
            type="primary"
          >
            {action.label}
          </Button>
        )
      })}
    </Space>
  )
}

// --- SUB-COMPONENT: Thanh tìm kiếm ---
const SearchBar = ({ placeholder, value, onChange, onSearch }) => {
  return (
    <Input
      allowClear
      prefix={<SearchOutlined />}
      placeholder={placeholder || 'Tìm kiếm...'}
      style={{ maxWidth: 360, minWidth: 280 }}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={(e) => onSearch?.(e.target.value)}
    />
  )
}

// ==========================================
// MAIN COMPONENT: Management Layout (Viewport Radar Height)
// ==========================================
export default function ManagementLayout({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  extraFilters,
  actions = [],
  tableProps,
  children
}) {
  const tableWrapperRef = useRef(null)
  
  const [tableScrollY, setTableScrollY] = useState('60%') 

  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableWrapperRef.current) {
        const topPosition = tableWrapperRef.current.getBoundingClientRect().top
        
        const availableHeight = window.innerHeight - topPosition - 120 
        
        setTableScrollY(availableHeight > 250 ? availableHeight : 250)
      }
    }

    calculateTableHeight()
    window.addEventListener('resize', calculateTableHeight)
    return () => window.removeEventListener('resize', calculateTableHeight)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', height: '100%', overflow: 'hidden' }}>
      {/* PHẦN TOP: Cố định kích thước */}
      <div style={{ flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <Space style={{ flex: 1, flexWrap: 'wrap' }}>
          {(onSearchChange || onSearchSubmit) && (
            <SearchBar placeholder={searchPlaceholder} value={searchValue} onChange={onSearchChange} onSearch={onSearchSubmit} />
          )}
          {extraFilters}
        </Space>
        <ActionGroup actions={actions} />
      </div>

      {/* PHẦN BODY: Bảng Table */}
      <div ref={tableWrapperRef} style={{ flex: 1, overflow: 'hidden', width: '100%' }}>
        <ManagementTable 
          {...tableProps} 
          scroll={{ ...tableProps?.scroll, x: 'max-content', y: tableScrollY }} 
        />
        {children}
      </div>
      
    </div>
  )
}