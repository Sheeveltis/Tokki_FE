'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Input, Space, Tag } from 'antd'
import { EyeOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import { fetchFlashcardTopics } from '../../api'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

export function FlashcardTopicManagement({ initialData = null }) {
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
        const res = await fetchFlashcardTopics()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [initialData])

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = [
    { title: 'Mã', dataIndex: 'id', key: 'id', width: 200 },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
    { title: 'Mô tả', dataIndex: 'subtitle', key: 'subtitle' },
    { title: 'Level', dataIndex: 'level', key: 'level', width: 120 },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 140,
      render: (_, record) => (
        <Tag color={record.muted ? 'default' : 'green'} style={{ fontSize: 12, padding: '2px 6px' }}>
          {record.muted ? 'Ẩn' : 'Đang dùng'}
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
            router.push(`/admin/vocab-topic/${record.id}`)
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
          placeholder="Tìm theo mã, tiêu đề, mô tả"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm chủ đề"
          color="#F1BE4B"
          onPress={() => setDrawerItem({})}
          style={{ minWidth: 140, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
          icon={<PlusOutlined />}
        />
      </Space>
      <ManagementTable columns={columns} dataSource={filteredData} loading={loading} onRowClick={(record) => setDrawerItem(record)} />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết chủ đề flashcard"
        data={drawerItem || {}}
      />
    </>
  )
}

export default FlashcardTopicManagement

