'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'solito/navigation'
import { Space, Tag, Select, Tooltip } from 'antd'
import { EyeOutlined, FilterOutlined, PlusOutlined } from '@ant-design/icons'
import ManagementLayout from '../../../../../components/layout/management-layout.jsx'
import { useExamsAdmin } from '../../api/exam-hooks.js'
import CreateExamModal from '../../components/admin/create-exam-modal.jsx'
import { useQueryClient } from '@tanstack/react-query'

const { Option } = Select

// Map status enum values to display text
const STATUS_MAP = {
  0: { color: '#8c8c8c', text: 'Nháp' },
  1: { color: '#52c41a', text: 'Đã xuất bản' },
  2: { color: '#f5222d', text: 'Đã xóa' },
}

// Map type enum values to display text
const TYPE_MAP = {
  1: 'TOPIK I',
  2: 'TOPIK II',
}

export function ExamManagement({ initialData = null }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    type: undefined,
    page: 1,
    size: 20,
  })

  const [createModalOpen, setCreateModalOpen] = useState(false)

  // Fetch exams from API
  const { data: examsData, isLoading } = useExamsAdmin({
    PageNumber: filters.page,
    PageSize: filters.size,
    SearchTerm: filters.search || undefined,
    Status: filters.status === 'ALL' ? undefined : filters.status,
    Type: filters.type,
  })

  const data = examsData?.items || initialData || []

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePaginationChange = (newPage, newSize) => {
    setFilters(prev => {
      const isSizeChanged = prev.size !== newSize;
      return {
        ...prev,
        size: newSize,
        page: isSizeChanged ? 1 : newPage
      }
    })
  }

  const columns = useMemo(() => [
    {
      title: () => (
        <Tooltip title="Số thứ tự">
          <span>STT</span>
        </Tooltip>
      ),
      key: 'stt',
      align: 'center',
      width: 60,
      render: (_, __, index) => (filters.page - 1) * filters.size + index + 1
    },
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
      align: 'center',
      render: (status) => {
        const statusInfo = STATUS_MAP[status] || { color: '#8c8c8c', text: `Status ${status}` }
        return (
          <Tooltip title={statusInfo.text}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                backgroundColor: statusInfo.color,
                margin: '0 auto',
                boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
        )
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      align: 'center',
      width: 90,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <EyeOutlined
            style={{ fontSize: 18, cursor: 'pointer', color: '#1890ff' }}
            onClick={(e) => {
              e?.stopPropagation?.()
              router.push(`/admin/exams/${record.examId}`)
            }}
          />
        </Tooltip>
      ),
    },
  ], [filters, router])

  const extraFilters = (
    <Space wrap>
      <Select
        placeholder="Trạng thái"
        allowClear
        style={{ width: 160 }}
        value={filters.status}
        onChange={(val) => handleFilterChange('status', val || 'ALL')}
        suffixIcon={<FilterOutlined />}
      >
        <Option value="ALL">Tất cả trạng thái</Option>
        <Option value={0}>Nháp</Option>
        <Option value={1}>Đã xuất bản</Option>
        <Option value={2}>Đã xóa</Option>
      </Select>
      <Select
        placeholder="Loại đề"
        allowClear
        style={{ width: 160 }}
        value={filters.type}
        onChange={(val) => handleFilterChange('type', val)}
        suffixIcon={<FilterOutlined />}
      >
        <Option value={1}>TOPIK I</Option>
        <Option value={2}>TOPIK II</Option>
        <Option value={3}>Test đầu vào</Option>
      </Select>
    </Space>
  )

  const actions = [
    {
      label: 'Thêm mới',
      icon: <PlusOutlined />,
      type: 'primary',
      onPress: () => setCreateModalOpen(true)
    }
  ]

  return (
    <>
      <ManagementLayout
        searchPlaceholder="Tìm kiếm tiêu đề, cấu trúc đề..."
        searchValue={filters.search}
        onSearchChange={val => setFilters(prev => ({ ...prev, search: val }))}
        onSearchSubmit={() => handleFilterChange('search', filters.search)}
        extraFilters={extraFilters}
        actions={actions}
        tableProps={{
          columns,
          dataSource: data,
          loading: isLoading && !initialData,
          rowKey: "examId",
          pagination: {
            current: filters.page,
            pageSize: filters.size,
            total: examsData?.total || 0,
            showSizeChanger: true,
            onChange: handlePaginationChange
          }
        }}
      />
      <CreateExamModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={async (examId) => {
          await queryClient.invalidateQueries({ queryKey: ['exams', 'admin'] })
          router.push(`/admin/exams/${examId}`)
        }}
      />
    </>
  )
}

export default ExamManagement
