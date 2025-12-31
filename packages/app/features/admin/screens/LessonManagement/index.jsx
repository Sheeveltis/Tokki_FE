'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { useLessonsQuery } from '../../api/useAdminQueries'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

export function LessonManagement({ initialData = null }) {
  const router = useRouter()
  const { data = initialData || [], isLoading } = useLessonsQuery(initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')

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

  const columns = [
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
            router.push(`/admin/lessons/${record.id}`)
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
  ]

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
        <ButtonV2
          title="Thêm"
          color="#F1BE4B"
          onPress={() => router.push('/admin/lessons/create')}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={isLoading && !initialData}
        onRowClick={(record) => setDrawerItem(record)}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết bài học"
        data={drawerItem || {}}
      />
    </>
  )
}

export default LessonManagement

