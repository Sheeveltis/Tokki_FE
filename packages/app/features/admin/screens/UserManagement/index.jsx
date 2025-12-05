'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tag, Input, Space } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../string.js'
import { fetchUsers } from '../../api'
import ManagementTable from '../../components/common/ManagementTable'
import DetailDrawer from '../../components/common/DetailDrawer'

/**
 * UserManagement: hiển thị danh sách user; mode=admin chỉ lọc Admin/Staff.
 */
export function UserManagement({ mode = 'all', initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState(initialData || [])
  const [loading, setLoading] = useState(!initialData)
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (initialData) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchUsers()
        setData(res)
      } catch (error) {
        // Error đã được xử lý trong api/index.js với apiErrors
        console.error('Lỗi tải danh sách người dùng:', error.message)
        // Có thể thêm message.error(error.message) nếu cần hiển thị toast
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialData])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = mode === 'admin'
      ? data.filter((u) => ['Admin', 'Staff'].includes(u.role))
      : data
    if (!q) return base
    return base.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.role || '').toLowerCase().includes(q) ||
        (u.status || '').toLowerCase().includes(q),
    )
  }, [data, mode, search])

  const tabKey = mode === 'admin' ? 'users-admin' : 'users-all'

  const columns = [
    { title: 'Tên', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (val) => (
        <Tag color={val === 'Active' ? 'green' : 'red'} style={{ fontSize: '12px', padding: '2px 8px' }}>
          {statusUser[val] || val}
        </Tag>
      ),
    },
    {
      title: 'Xem',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <div
          onClick={(e) => {
            e?.stopPropagation?.()
            router.push(`/admin/users/${record.id}?tab=${tabKey}`)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: '4px 8px',
          }}
        >
          <EyeOutlined style={{ fontSize: 18, color: '#111' }} />
        </div>
      ),
    },
  ]

  const handleSave = async () => {
    if (!drawerItem) return
    // navigation only now
  }

  return (
    <>
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between' }}>
        <Input
          allowClear
          prefix={<SearchOutlined />}
          placeholder="Tìm theo tên, email, role, trạng thái"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm"
          color="#F1BE4B"
          onPress={() => router.push(mode === 'admin' ? '/admin/users/create-admin-staff' : '/admin/users/create')}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        onRowClick={(record) => setDrawerItem(record)}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết người dùng"
        data={drawerItem || {}}
      />
    </>
  )
}

export default UserManagement

