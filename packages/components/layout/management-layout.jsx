import { useRef, useState, useEffect } from 'react'
import { Input, Space, Button, Card, Typography } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import ManagementTable from '../ManagementTable.jsx' 

const { Text } = Typography

// --- SUB-COMPONENT: Nút thao tác động ---
const ActionGroup = ({ actions = [] }) => {
  if (!actions || actions.length === 0) return null
  return (
    <Space size="middle">
      {actions.map((action, index) => {
        if (action.hidden) return null
        return (
          <Button
            key={action.key || index}
            onClick={action.onPress}
            icon={action.icon}
            type={action.type || 'primary'}
            style={{ 
              borderRadius: 8,
              height: 40,
              padding: '0 20px',
              fontWeight: 600,
              ...action.style 
            }}
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
      size="large"
      prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
      placeholder={placeholder || 'Tìm kiếm...'}
      style={{ 
        maxWidth: 400, 
        minWidth: 300,
        borderRadius: 8,
        height: 40
      }}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      onPressEnter={(e) => onSearch?.(e.target.value)}
    />
  )
}

// ==========================================
// MAIN COMPONENT: Management Layout
// ==========================================
export default function ManagementLayout({
  searchPlaceholder,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  extraFilters,
  actions = [],
  tableProps,
  children,
  title
}) {
  const tableWrapperRef = useRef(null)
  const [tableScrollY, setTableScrollY] = useState(400) 

  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableWrapperRef.current) {
        const rect = tableWrapperRef.current.getBoundingClientRect()
        // Tính toán chiều cao khả dụng trừ đi pagination (khoảng 64px) và padding bottom
        const availableHeight = window.innerHeight - rect.top - 100
        setTableScrollY(availableHeight > 300 ? availableHeight : 300)
      }
    }

    // Delay một chút để layout render xong
    const timer = setTimeout(calculateTableHeight, 100)
    window.addEventListener('resize', calculateTableHeight)
    return () => {
      window.removeEventListener('resize', calculateTableHeight)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 20, 
      width: '100%', 
      height: '100%',
      // Sử dụng flex 1 để chiếm hết không gian của card cha
    }}>
      {/* HEADER SECTION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: 16,
        paddingBottom: 4
      }}>
        <Space size="middle" style={{ flex: 1, flexWrap: 'wrap' }}>
          {(onSearchChange || onSearchSubmit) && (
            <SearchBar 
              placeholder={searchPlaceholder} 
              value={searchValue} 
              onChange={onSearchChange} 
              onSearch={onSearchSubmit} 
            />
          )}
          {extraFilters}
        </Space>
        <ActionGroup actions={actions} />
      </div>

      {/* TABLE SECTION */}
      <div 
        ref={tableWrapperRef} 
        style={{ 
          flex: 1, 
          overflow: 'hidden', 
          width: '100%',
          borderRadius: 8,
          // border: '1px solid #f0f0f0'
        }}
      >
        <ManagementTable 
          {...tableProps} 
          scroll={{ ...tableProps?.scroll, x: 'max-content', y: tableScrollY }} 
          size="middle"
        />
        {children}
      </div>
    </div>
  )
}