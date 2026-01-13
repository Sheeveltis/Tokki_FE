import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'solito/navigation'
import { Tag, Input, Space } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'

import { ButtonV2 } from '../../../../../../components/buttonV2.jsx'
import { statusUser } from '../../../../../string.js'
import { fetchUsers } from '../api/api'
import ManagementTable from '../../../../../../components/ManagementTable'
import AccountDetails from './account-details'

/**
 * AccountManage: hiển thị danh sách user; mode=admin chỉ lọc Admin/Staff.
 */
export default function AccountManage({ mode = 'all', basePath = '/admin', initialData = null }) {
  const router = useRouter()
  const [data, setData] = useState(initialData?.items || [])
  const [loading, setLoading] = useState(!initialData)
  const [search, setSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(initialData?.total || 0)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const isAdminStaffRole = (role) => [1, 2].includes(Number(role))
  // Người dùng + Thành viên VIP (theo mô tả: 0 & 3; chấp nhận 4 nếu BE dùng)
  const isUserRole = (role) => [0, 3, 4].includes(Number(role))

  const loadUsers = async ({ page = pageNumber, size = pageSize, q = search } = {}) => {
    try {
      setLoading(true)
      const res = await fetchUsers({ pageNumber: page, pageSize: size, search: q })
      let items = res.items || []

      if (mode === 'admin') {
        items = items.filter((u) => isAdminStaffRole(u.role))
      } else {
        // Tất cả Users: chỉ hiển thị người dùng (0) và thành viên VIP (3/4)
        items = items.filter((u) => isUserRole(u.role))
      }

      setData(items)
      setTotal(res.total || items.length)
      setPageNumber(page)
      setPageSize(size)
      if (!selectedUserId && items.length) {
        setSelectedUserId(items[0].id || items[0].userId)
      }
    } catch (error) {
      console.error('Lỗi tải danh sách người dùng:', error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialData) {
      let items = initialData.items || []
      if (mode === 'admin') items = items.filter((u) => isAdminStaffRole(u.role))
      else items = items.filter((u) => isUserRole(u.role))
      setData(items)
      setTotal(initialData.total || items.length)
      if (!selectedUserId && items.length) {
        setSelectedUserId(items[0].id || items[0].userId)
      }
      return
    }
    loadUsers({ page: 1, size: pageSize, q: search })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(q) ||
        (u.fullName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        String(u.role || '').toLowerCase().includes(q) ||
        String(u.status || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const tabKey = mode === 'admin' ? 'users-admin' : 'users-all'

  const getRoleLabel = (val) => {
    const r = Number(val)
    switch (r) {
      case 0:
        return 'Người dùng'
      case 1:
        return 'Quản trị viên'
      case 2:
        return 'Nhân viên'
      case 3:
        return 'Thành viên VIP'
      case 4:
        return 'Kiểm duyệt viên'
      default:
        return String(val ?? '')
    }
  }

  const getStatusLabel = (val) => {
    const s = Number(val)
    switch (s) {
      case 0:
        return 'Vô hiệu hóa'
      case 1:
        return 'Hoạt động'
      case 2:
        return 'Đã bị khóa'
      default:
        return String(val ?? '')
    }
  }

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (_, record) => record.fullName || record.name || '',
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (val) => getRoleLabel(val),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (val) => {
        const s = Number(val)
        const color = s === 1 ? 'green' : s === 2 ? 'red' : 'default'
        return (
          <Tag color={color} style={{ fontSize: '12px', padding: '2px 8px' }}>
            {getStatusLabel(val)}
          </Tag>
        )
      },
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
            const userId = record.id || record.userId
            router.push(`${basePath}/users/${userId}`)
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

  const handleTableChange = (pagination) => {
    const { current, pageSize: newSize } = pagination
    loadUsers({ page: current, size: newSize, q: search })
  }

  if (showDetail && selectedUserId) {
    return (
      <div style={{ padding: 12 }}>
        <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'flex-start' }}>
          <ButtonV2
            title="Quay lại danh sách"
            color="mint"
            onPress={() => {
              setShowDetail(false)
              loadUsers({ page: pageNumber, size: pageSize, q: search })
            }}
            style={{ minWidth: 140, paddingVertical: 10 }}
            textStyle={{ fontSize: 14 }}
          />
        </Space>
        <AccountDetails
          userId={selectedUserId}
          onAfterChange={() => loadUsers({ page: pageNumber, size: pageSize, q: search })}
        />
      </div>
    )
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
          onPressEnter={(e) => loadUsers({ page: 1, size: pageSize, q: e.target.value })}
        />
        {mode === 'admin' && (
          <ButtonV2
            title="Thêm"
            color="#F1BE4B"
            onPress={() => router.push(`${basePath}/users/create-admin-staff`)}
            style={{ minWidth: 80, paddingVertical: 10 }}
            textStyle={{ fontSize: 14 }}
          />
        )}
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        pagination={{
          current: pageNumber,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (page, size) => handleTableChange({ current: page, pageSize: size }),
        }}
        onRowClick={(record) => {
          const userId = record.id || record.userId
          router.push(`${basePath}/users/${userId}`)
        }}
      />
    </>
  )
}
