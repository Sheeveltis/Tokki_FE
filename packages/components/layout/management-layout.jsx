import { useRef, useState, useEffect } from 'react'
import { Input, Space, Button, Card, Typography, Pagination } from 'antd'
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
            loading={action.loading}
            type={action.type || 'primary'}
            style={{
              borderRadius: 20,
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
        maxWidth: 300,
        minWidth: 200,
        borderRadius: 16,
        height: 32,
        fontSize: 13
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

  // Tách pagination ra để hiển thị riêng bên dưới bảng
  const paginationProps = tableProps?.pagination

  useEffect(() => {
    const calculateTableHeight = () => {
      if (tableWrapperRef.current) {
        const rect = tableWrapperRef.current.getBoundingClientRect()
        // Giảm bớt khoảng trừ vì pagination đã nằm ngoài
        const availableHeight = window.innerHeight - rect.top - 60
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
      position: 'relative',
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
        }}
      >
        <ManagementTable
          {...tableProps}
          pagination={false} // Disable nội bộ bảng
          scroll={{ ...tableProps?.scroll, x: 'max-content', y: tableScrollY }}
          size="middle"
        />
        {children}
      </div>

      {/* PAGINATION SECTION - STICKY TO BOTTOM */}
      {paginationProps && (
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          padding: '12px 16px',
          backgroundColor: '#fff',
          borderRadius: '0 0 8px 8px',
          borderTop: '1px solid #f0f0f0',
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          boxShadow: '0 -2px 8px rgba(0,0,0,0.05)'
        }}>
          <Pagination
            {...paginationProps}
            onChange={paginationProps.onChange}
          />
        </div>
      )}
    </div>
  )
}
