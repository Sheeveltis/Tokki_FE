import { useRef, useState, useEffect } from 'react'
import { Input, Space, Button, Card, Typography, Pagination, Segmented, List, Empty, Tooltip } from 'antd'
import { SearchOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons'
import ManagementTable from '../ManagementTable.jsx'

const { Text } = Typography

// --- SUB-COMPONENT: Nút thao tác động ---
const ActionGroup = ({ actions = [] }) => {
  if (!actions || actions.length === 0) return null
  return (
    <Space size="middle" style={{ flexWrap: 'wrap' }}>
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
              borderRadius: '2rem',
              height: 'clamp(36px, 40px, 44px)',
              padding: '0 1.25rem',
              fontWeight: 600,
              fontSize: 'clamp(13px, 1.2vw, 15px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              whiteSpace: 'nowrap',
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
        width: 'min(320px, 100%)',
        borderRadius: '1rem',
        height: 'clamp(32px, 36px, 40px)',
        fontSize: 'clamp(13px, 1.1vw, 14px)'
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
  title,
  renderCard // Thêm prop renderCard để hiển thị dạng card
}) {
  const tableWrapperRef = useRef(null)
  const [tableScrollY, setTableScrollY] = useState(400)
  const [viewMode, setViewMode] = useState('table') // 'table' hoặc 'card'

  // Tách pagination ra để hiển thị riêng bên dưới bảng
  const paginationProps = tableProps?.pagination

  useEffect(() => {
    // Đặt chiều cao cố định để giao diện ổn định, không bị nhảy theo nội dung hay resize linh hoạt
    setTableScrollY(580)
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
        gap: '1rem',
        paddingBottom: '0.5rem'
      }}>
        <Space size="middle" style={{ flex: '1 1 auto', flexWrap: 'wrap', gap: '0.75rem' }}>
          {(onSearchChange || onSearchSubmit) && (
            <SearchBar
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              onSearch={onSearchSubmit}
            />
          )}
          {extraFilters}
          {renderCard && (
            <Segmented
              style={{ borderRadius: '0.75rem', padding: '2px' }}
              options={[
                {
                  value: 'table',
                  icon: <Tooltip title="Xem dạng bảng"><TableOutlined style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }} /></Tooltip>
                },
                {
                  value: 'card',
                  icon: <Tooltip title="Xem dạng lưới"><AppstoreOutlined style={{ fontSize: 'clamp(14px, 1.2vw, 18px)' }} /></Tooltip>
                },
              ]}
              value={viewMode}
              onChange={setViewMode}
            />
          )}
        </Space>
        <ActionGroup actions={actions} />
      </div>

      {/* UNIFIED CONTENT BOX (TABLE/CARDS + PAGINATION) */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* CONTENT SECTION */}
        <div
          ref={tableWrapperRef}
          style={{
            height: tableScrollY,
            overflowY: viewMode === 'table' ? 'hidden' : 'auto',
            overflowX: 'auto',
            width: '100%',
          }}
        >
          {viewMode === 'table' ? (
            <ManagementTable
              {...tableProps}
              pagination={false}
              scroll={{ ...tableProps?.scroll, x: 'max-content', y: tableScrollY }}
              size="middle"
            />
          ) : (
            <div style={{ padding: '24px 24px 24px 24px' }}>
              <List
                grid={{
                  gutter: 16,
                  xs: 1,
                  sm: 2,
                  md: 2,
                  lg: 3,
                  xl: 4,
                  xxl: 4,
                }}
                rowKey={(item) => item.id || item.userId || item.key || item.email}
                loading={tableProps?.loading}
                dataSource={tableProps?.dataSource || []}
                renderItem={(item) => (
                  <List.Item>
                    {renderCard(item)}
                  </List.Item>
                )}
                locale={{
                  emptyText: <Empty description="Không có dữ liệu" />
                }}
              />
            </div>
          )}
          {children}
        </div>

        {/* PAGINATION SECTION */}
        {paginationProps && (
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            padding: '16px 32px',
            backgroundColor: '#fff',
            borderTop: '1px solid #f0f0f0',
            zIndex: 10,
          }}>
            <Pagination
              {...paginationProps}
              showSizeChanger
              showTotal={(total) => <span style={{ fontSize: 'clamp(12px, 1vw, 14px)', fontWeight: 500 }}>Tổng {total} mục</span>}
              onChange={paginationProps.onChange}
            />
          </div>
        )}
      </div>
    </div>
  )
}
