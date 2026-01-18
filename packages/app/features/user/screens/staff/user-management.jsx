'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Tag, Input, Space } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../string.js'
import { fetchRegularUsers } from '../../../back-office/api/staff-index.js'
import ManagementTable from '../../../../../components/ManagementTable.jsx'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import { message } from 'antd'
import { handleApiError } from '../../../back-office/api/staff-index.js'

/**
 * UserManagement cho Staff: chỉ hiển thị users thường, không có Admin/Staff
 */
export function UserManagement({ initialData = null }) {
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
        const res = await fetchRegularUsers()
        setData(res)
      } catch (err) {
        message.error(handleApiError(err, 'Không thể tải danh sách người dùng.'))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialData])

  const filteredData = useMemo(() => {
    if (!search) return data
    const lowerSearch = search.toLowerCase()
    return data.filter(
      (item) =>
        item.name?.toLowerCase().includes(lowerSearch) ||
        item.email?.toLowerCase().includes(lowerSearch) ||
        item.role?.toLowerCase().includes(lowerSearch) ||
        item.status?.toLowerCase().includes(lowerSearch),
    )
  }, [data, search])

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
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
            // Dùng lại cùng JSX chi tiết user (UserDetailScreen) qua route riêng cho staff
            // Tab mặc định bên trong UserDetailScreen là 'users-all', nên truyền thẳng để đồng bộ
            router.push(`/staff/users/${record.id}?tab=users-all`)
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

