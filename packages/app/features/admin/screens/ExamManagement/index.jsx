'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Tag } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

export function ExamManagement({ initialData = null }) {
  const router = useRouter()
  // TODO: Thay thế bằng API query thực tế khi có
  const data = initialData || []
  const isLoading = false
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.templateName || '').toLowerCase().includes(q) ||
        (item.status || '').toLowerCase().includes(q) ||
        (item.updatedAt || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = [
    { title: 'Tiêu đề đề thi', dataIndex: 'title', key: 'title' },
    { title: 'Mẫu đề', dataIndex: 'templateName', key: 'templateName' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const statusMap = {
          draft: { color: 'default', text: 'Nháp' },
          published: { color: 'green', text: 'Đã xuất bản' },
          archived: { color: 'gray', text: 'Đã lưu trữ' },
          active: { color: 'blue', text: 'Đang hoạt động' },
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
      }
    },
    { title: 'Số câu hỏi', dataIndex: 'questionCount', key: 'questionCount' },
    { title: 'Thời gian (phút)', dataIndex: 'duration', key: 'duration' },
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
            router.push(`/admin/exams/${record.id}`)
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
          placeholder="Tìm theo tiêu đề, mẫu đề, trạng thái"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm đề"
          color="#F1BE4B"
          onPress={() => router.push('/admin/exams/create')}
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
        title="Chi tiết đề thi"
        data={drawerItem || {}}
      />
    </>
  )
}

export default ExamManagement

