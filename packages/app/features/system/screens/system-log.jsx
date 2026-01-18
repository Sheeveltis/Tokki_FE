'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../components/buttonV2.jsx'
import { useSystemLogsQuery } from '../../back-office/api/useAdminQueries.js'
import ManagementTable from '../../../../components/ManagementTable.jsx'
import DetailDrawer from '../../../../components/DetailDrawer.jsx'

export function SystemLog({ initialData = null }) {
  const router = useRouter()
  const { data = initialData || [], isLoading } = useSystemLogsQuery(initialData)
  const [search, setSearch] = useState('')
  const [drawerItem, setDrawerItem] = useState(null)

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (item) =>
        (item.level || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q) ||
        (item.timestamp || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = [
    { title: 'Mức', dataIndex: 'level', key: 'level' },
    { title: 'Nội dung', dataIndex: 'message', key: 'message' },
    { title: 'Thời gian', dataIndex: 'timestamp', key: 'timestamp' },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`/admin/logs/${record.id}`)
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
          placeholder="Tìm theo mức, nội dung, thời gian"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div />
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
        title="Log detail"
        data={drawerItem || {}}
      />
    </>
  )
}

export default SystemLog

