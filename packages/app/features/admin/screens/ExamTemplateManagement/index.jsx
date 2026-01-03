'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ManagementTable from '../../../../../components/ManagementTable'
import DetailDrawer from '../../../../../components/DetailDrawer'
import CreateExamTemplateModal from './create/CreateExamTemplateModal'

// Mock data mẫu - sẽ thay bằng API query khi có
const mockExamTemplates = [
  {
    ExamTemplateId: 1,
    name: 'Mẫu Đề TOPIK I',
    description: 'Đề gồm 30 câu nghe, 40 câu đọc và 3 câu viết',
    examType: 'TOPIK I',
    questionCount: 73,
    duration: 100,
    updatedAt: '2024-01-15',
    createdAt: '2024-01-15',
    isActive: true,
  },
  {
    ExamTemplateId: 2,
    name: 'Mẫu Đề TOPIK II',
    description: 'Đề gồm 50 câu nghe, 50 câu đọc và 4 câu viết',
    examType: 'TOPIK II',
    questionCount: 104,
    duration: 180,
    updatedAt: '2024-01-16',
    createdAt: '2024-01-16',
    isActive: true,
  },
  {
    ExamTemplateId: 3,
    name: 'Mẫu Đề Test đầu vào',
    description: 'Đề kiểm tra trình độ đầu vào, gồm 20 câu nghe và 20 câu đọc',
    examType: 'Test đầu vào',
    questionCount: 40,
    duration: 60,
    updatedAt: '2024-01-17',
    createdAt: '2024-01-17',
    isActive: true,
  },
]

export function ExamTemplateManagement({ initialData = null }) {
  const router = useRouter()
  // TODO: Thay thế bằng API query thực tế khi có
  const data = initialData || mockExamTemplates
  const isLoading = false
  const [drawerItem, setDrawerItem] = useState(null)
  const [search, setSearch] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return data
    return data.filter(
      (item) =>
        (item.name || item.Name || '').toLowerCase().includes(q) ||
        (item.description || item.Description || '').toLowerCase().includes(q) ||
        (item.examType || item.ExamType || '').toLowerCase().includes(q),
    )
  }, [data, search])

  const columns = [
    { 
      title: 'Tên mẫu đề', 
      dataIndex: 'name', 
      key: 'name',
      render: (text, record) => text || record.Name || '-'
    },
    { 
      title: 'Loại đề', 
      dataIndex: 'examType', 
      key: 'examType',
      render: (text, record) => text || record.ExamType || '-'
    },
    { 
      title: 'Mô tả', 
      dataIndex: 'description', 
      key: 'description',
      ellipsis: true,
      render: (text, record) => text || record.Description || '-'
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
            const id = record.id || record.ExamTemplateId
            router.push(`/admin/exam-templates/${id}`)
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
          placeholder="Tìm theo tên, mô tả, loại đề"
          style={{ maxWidth: 360 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <ButtonV2
          title="Thêm mẫu đề"
          color="#F1BE4B"
          onPress={() => setCreateModalOpen(true)}
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
        title="Chi tiết mẫu đề"
        data={drawerItem || {}}
      />
      {createModalOpen && (
        <CreateExamTemplateModal
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          onSuccess={(examTemplateId) => {
            setCreateModalOpen(false)
            router.push(`/admin/exam-templates/${examTemplateId}`)
          }}
        />
      )}
    </>
  )
}

export default ExamTemplateManagement

