'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Tag } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'

export function QuestionBankManagement({ initialData = null }) {
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
        (item.content || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q) ||
        (item.difficulty || '').toLowerCase().includes(q) ||
        (item.updatedAt || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = [
    { title: 'Nội dung câu hỏi', dataIndex: 'content', key: 'content', ellipsis: true },
    { 
      title: 'Danh mục', 
      dataIndex: 'category', 
      key: 'category',
      render: (category) => category ? <Tag color="blue">{category}</Tag> : '-'
    },
    { 
      title: 'Độ khó', 
      dataIndex: 'difficulty', 
      key: 'difficulty',
      render: (difficulty) => {
        const colorMap = {
          easy: 'green',
          medium: 'orange',
          hard: 'red',
        }
        return difficulty ? (
          <Tag color={colorMap[difficulty] || 'default'}>{difficulty}</Tag>
        ) : '-'
      }
    },
    { title: 'Loại câu hỏi', dataIndex: 'type', key: 'type' },
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
            router.push(`/admin/question-bank/${record.id}`)
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
          placeholder="Tìm theo nội dung, danh mục, độ khó"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm câu hỏi"
          color="#F1BE4B"
          onPress={() => router.push('/admin/question-bank/create')}
          style={{ minWidth: 120, paddingVertical: 10 }}
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
        title="Chi tiết câu hỏi"
        data={drawerItem || {}}
      />
    </>
  )
}

export default QuestionBankManagement

