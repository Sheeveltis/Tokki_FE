'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Button } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useLessonsQuery } from '../../../back-office/api/useAdminQueries.js'
import ManagementTable from '../../../../../components/ManagementTable'

export function LessonManagement({ initialData = null }) {
  const router = useRouter()
  const { data = initialData || [], isLoading } = useLessonsQuery(initialData)
  const [search, setSearch] = useState('')

  // Xác định cổng hiện tại dựa vào URL
  const getCurrentPortal = () => {
    if (typeof window === 'undefined') return 'admin'
    const pathname = window.location.pathname
    if (pathname === '/staff' || pathname.startsWith('/staff/')) return 'staff'
    if (pathname === '/moderator' || pathname.startsWith('/moderator/')) return 'moderator'
    return 'admin'
  }
  
  const currentPortal = getCurrentPortal()
  
  // Tính toán portalPrefix một lần dựa trên currentPortal
  const portalPrefix = useMemo(() => {
    return currentPortal === 'staff' ? '/staff' : currentPortal === 'moderator' ? '/moderator' : '/admin'
  }, [currentPortal])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.author || '').toLowerCase().includes(q) ||
        (item.updatedAt || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = useMemo(() => [
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Tác giả', dataIndex: 'author', key: 'author' },
    { title: 'Cập nhật', dataIndex: 'updatedAt', key: 'updatedAt' },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`${portalPrefix}/lessons/${record.id}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 4,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          <EyeOutlined style={{ fontSize: 18, color: '#111', transition: 'color 0.2s ease' }} />
        </div>
      ),
    },
  ], [portalPrefix, router])

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tiêu đề, tác giả, ngày cập nhật"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          type="primary"
          onClick={() => router.push(`${portalPrefix}/lessons/create`)}
          style={{ height: 'auto', padding: '8px 24px', backgroundColor: '#F1BE4B', borderColor: '#F1BE4B' }}
        >
          Thêm
        </Button>
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={isLoading && !initialData}
      />
    </>
  )
}


