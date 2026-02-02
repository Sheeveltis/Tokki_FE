'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'solito/navigation'
import { Input, Space, Tag, Select } from 'antd'
import { EyeOutlined, SearchOutlined } from '@ant-design/icons'
import { ButtonV2 } from '../../../../../components/buttonV2.jsx'
import ManagementTable from '../../../../../components/ManagementTable.jsx'
import DetailDrawer from '../../../../../components/DetailDrawer.jsx'
import { useExamsAdmin } from '../../api/exam-hooks.js'
import CreateExamModal from '../../components/admin/create-exam-modal.jsx'
import { useQueryClient } from '@tanstack/react-query'

const { Option } = Select

// Map status enum values to display text
const STATUS_MAP = {
  0: { color: 'default', text: 'Nháp' },
  1: { color: 'green', text: 'Đã xuất bản' },
  2: { color: 'red', text: 'Đã xóa' },
}

// Map type enum values to display text
const TYPE_MAP = {
  1: 'TOPIK I',
  2: 'TOPIK II',
  3: 'Test đầu vào',
}

export function ExamManagement({ initialData = null }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize] = useState(20)
  const [statusFilter, setStatusFilter] = useState('ALL') // 'ALL' = tất cả trạng thái
  const [typeFilter, setTypeFilter] = useState(undefined) // undefined = tất cả
  const [drawerItem, setDrawerItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPageNumber(1) // Reset về trang 1 khi search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPageNumber(1)
  }, [statusFilter, typeFilter])

  // Fetch exams from API
  const { data: examsData, isLoading } = useExamsAdmin({
    PageNumber: pageNumber,
    PageSize: pageSize,
    SearchTerm: debouncedSearchTerm || undefined,
    Status: statusFilter === 'ALL' ? undefined : statusFilter,
    Type: typeFilter,
  })

  const data = examsData?.items || initialData || []

  const columns = [
    { 
      title: 'ID Đề thi', 
      dataIndex: 'examId', 
      key: 'examId',
      width: 120,
    },
    { 
      title: 'Tiêu đề', 
      dataIndex: 'title', 
      key: 'title',
      ellipsis: true,
    },
    { 
      title: 'Cấu trúc đề', 
      dataIndex: 'examTemplateName', 
      key: 'examTemplateName',
      ellipsis: true,
    },
    { 
      title: 'Loại đề', 
      dataIndex: 'type', 
      key: 'type',
      width: 120,
      render: (type) => {
        return <Tag color="blue" style={{ fontSize: 12 }}>{TYPE_MAP[type] || type}</Tag>
      }
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      width: 120,
      render: (status) => {
        const statusInfo = STATUS_MAP[status] || { color: 'default', text: `Status ${status}` }
        return <Tag color={statusInfo.color} style={{ fontSize: 12 }}>{statusInfo.text}</Tag>
      }
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
            router.push(`/admin/exams/${record.examId}`)
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
      <Space style={{ marginBottom: 12, width: '100%', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Space size="middle" style={{ flex: 1, minWidth: 600 }}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm kiếm..."
            style={{ maxWidth: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onPressEnter={() => {
              setDebouncedSearchTerm(searchTerm)
              setPageNumber(1)
            }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            style={{ width: 150 }}
            value={statusFilter}
            onChange={(value) => {
              // Khi clear thì quay về "Tất cả trạng thái"
              if (value == null) {
                setStatusFilter('ALL')
              } else {
                setStatusFilter(value)
              }
            }}
          >
            <Option value="ALL">Tất cả trạng thái</Option>
            <Option value={0}>Nháp</Option>
            <Option value={1}>Đã xuất bản</Option>
            <Option value={2}>Đã xóa</Option>
          </Select>
          <Select
            placeholder="Loại đề"
            allowClear
            style={{ width: 150 }}
            value={typeFilter}
            onChange={(value) => setTypeFilter(value)}
          >
            <Option value={1}>TOPIK I</Option>
            <Option value={2}>TOPIK II</Option>
            <Option value={3}>Test đầu vào</Option>
          </Select>
        </Space>
        <ButtonV2
          title="Thêm đề"
          color="#F1BE4B"
          onPress={() => setCreateModalOpen(true)}
          style={{ minWidth: 80, paddingVertical: 10 }}
          textStyle={{ fontSize: 14 }}
        />
      </Space>
      <ManagementTable
        columns={columns}
        dataSource={data}
        loading={isLoading && !initialData}
        onRowClick={(record) => setDrawerItem(record)}
        pagination={{
          current: pageNumber,
          pageSize: pageSize,
          total: examsData?.total || 0,
          onChange: (page) => setPageNumber(page),
          showSizeChanger: false,
        }}
      />
      <DetailDrawer
        open={!!drawerItem}
        onClose={() => setDrawerItem(null)}
        title="Chi tiết đề thi"
        data={drawerItem || {}}
      />
      <CreateExamModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={async (examId) => {
          // Invalidate query để refresh danh sách
          await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
          // Navigate đến trang detail
          router.push(`/admin/exams/${examId}`)
        }}
      />
    </>
  )
}

export default ExamManagement

